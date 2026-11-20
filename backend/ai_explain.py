# File Location: backend/ai_explain.py
import sys
import math
import numpy as np
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import GroupKFold, cross_val_score
import shap

# Configuration Constants
DATASET_STEP_DEG = 0.25   # Grid resolution (in degrees) used to sample the continuous error surface
TREE_MAX_DEPTH = 4        # Maximum depth of the decision tree surrogate to keep rules interpretable
CV_NUM_FOLDS = 6          # Number of GroupKFold splits holding out whole tabular intervals

router = APIRouter()

class AIExplainRequest(BaseModel):
    method_id: str
    input_value: float = 0.0

# In-memory global cache for the surrogate pipeline
ML_PIPELINE = {
    "is_trained": False,
    "model": None,
    "explainer": None,
    "surrogate_r2_cv": 0.0,
    "training_r2": 0.0,
    "feature_names": ["theta", "distance_to_nearest_node", "position_in_interval", "interval_index"],
    "node_spacing": None,
    "quadrant_limit": None,
    "sine_radius": None,
    "error_message": None
}

def _get_main_symbols():
    """
    Imports GITIKAPADA_24_DIFFS, execute_aryabhata_jya, QUADRANT_LIMIT_DEG, and SINE_RADIUS_ARCMIN
    directly from main.py.
    """
    for mod_name in ("__main__", "main"):
        mod = sys.modules.get(mod_name)
        if (
            mod is not None
            and hasattr(mod, "GITIKAPADA_24_DIFFS")
            and hasattr(mod, "QUADRANT_LIMIT_DEG")
            and hasattr(mod, "SINE_RADIUS_ARCMIN")
        ):
            return mod.GITIKAPADA_24_DIFFS, mod.execute_aryabhata_jya, mod.QUADRANT_LIMIT_DEG, mod.SINE_RADIUS_ARCMIN
    import main as main_mod
    return main_mod.GITIKAPADA_24_DIFFS, main_mod.execute_aryabhata_jya, main_mod.QUADRANT_LIMIT_DEG, main_mod.SINE_RADIUS_ARCMIN

def extract_features(theta: float, node_spacing: float, quadrant_limit: float):
    """
    Computes the 4 geometric input features relative to the discrete tabular grid.
    """
    exact_idx = theta / node_spacing
    nearest_node_idx = round(exact_idx)
    nearest_node_val = nearest_node_idx * node_spacing
    distance_to_nearest_node = abs(theta - nearest_node_val)

    interval_index = int(math.floor(exact_idx))
    position_in_interval = exact_idx - interval_index
    max_intervals = int(round(quadrant_limit / node_spacing))
    if interval_index >= max_intervals:
        interval_index = max_intervals - 1
        position_in_interval = 1.0

    return [theta, distance_to_nearest_node, position_in_interval, interval_index]

def init_surrogate_model():
    """
    Builds the quadrant error dataset, computes GroupKFold cross-validated R²,
    fits the final DecisionTreeRegressor, and initializes shap.TreeExplainer.
    """
    try:
        GITIKAPADA_24_DIFFS, execute_aryabhata_jya, quadrant_limit, sine_radius = _get_main_symbols()

        num_intervals = len(GITIKAPADA_24_DIFFS)
        node_spacing = quadrant_limit / float(num_intervals)

        ML_PIPELINE["quadrant_limit"] = quadrant_limit
        ML_PIPELINE["node_spacing"] = node_spacing
        ML_PIPELINE["sine_radius"] = sine_radius

        # 1. Build dataset across the quadrant
        thetas = np.arange(DATASET_STEP_DEG, quadrant_limit + (DATASET_STEP_DEG / 2.0), DATASET_STEP_DEG)
        feature_rows = []
        errors = []

        for th in thetas:
            th_float = float(th)
            ancient_val, _, _, _, _, _ = execute_aryabhata_jya(th_float)
            modern_val = math.sin(math.radians(th_float))
            actual_error = abs(ancient_val - modern_val)

            feats = extract_features(th_float, node_spacing, quadrant_limit)
            feature_rows.append(feats)
            errors.append(actual_error)

        X = pd.DataFrame(feature_rows, columns=ML_PIPELINE["feature_names"])
        y = np.array(errors)
        groups = X["interval_index"].values

        # 2. Evaluate fair cross-validated R² using GroupKFold grouped by interval_index
        gkf = GroupKFold(n_splits=CV_NUM_FOLDS)
        cv_scores = cross_val_score(
            DecisionTreeRegressor(max_depth=TREE_MAX_DEPTH, random_state=42),
            X,
            y,
            cv=gkf,
            groups=groups,
            scoring="r2"
        )
        r2_cv = float(np.mean(cv_scores))

        # 3. Train final surrogate model on all data and record training R²
        dt = DecisionTreeRegressor(max_depth=TREE_MAX_DEPTH, random_state=42)
        dt.fit(X, y)
        r2_train = float(dt.score(X, y))

        # 4. Initialize SHAP TreeExplainer
        explainer = shap.TreeExplainer(dt)

        ML_PIPELINE["model"] = dt
        ML_PIPELINE["explainer"] = explainer
        ML_PIPELINE["surrogate_r2_cv"] = round(r2_cv, 4)
        ML_PIPELINE["training_r2"] = round(r2_train, 4)
        ML_PIPELINE["is_trained"] = True
        ML_PIPELINE["error_message"] = None

    except Exception as e:
        ML_PIPELINE["is_trained"] = False
        ML_PIPELINE["error_message"] = str(e)

init_surrogate_model()

@router.post("/api/ai-explain")
def get_ai_explanation(req: AIExplainRequest):
    if req.method_id != "aryabhata_sinetable":
        return {
            "supported": False,
            "reason": "not_applicable",
            "method_id": req.method_id,
            "message": "AI error model not applicable: error is constant/fixed"
        }

    if not ML_PIPELINE["is_trained"]:
        init_surrogate_model()

    if not ML_PIPELINE["is_trained"]:
        return {
            "supported": False,
            "reason": "model_error",
            "method_id": req.method_id,
            "message": "AI explanation unavailable for this input"
        }

    try:
        _, execute_aryabhata_jya, quadrant_limit, sine_radius = _get_main_symbols()
        node_spacing = ML_PIPELINE["node_spacing"]

        theta = float(req.input_value)
        if not math.isfinite(theta) or not (0.0 < theta <= quadrant_limit):
            return {
                "supported": False,
                "reason": "invalid_input",
                "method_id": req.method_id,
                "message": "AI explanation unavailable for this input"
            }

        feats = extract_features(theta, node_spacing, quadrant_limit)
        X_eval = pd.DataFrame([feats], columns=ML_PIPELINE["feature_names"])

        # True error from deterministic execution
        ancient_val, _, _, _, _, _ = execute_aryabhata_jya(theta)
        modern_val = math.sin(math.radians(theta))
        true_error = abs(ancient_val - modern_val)

        # Surrogate prediction and SHAP values
        predicted_error = float(ML_PIPELINE["model"].predict(X_eval)[0])
        shap_values = ML_PIPELINE["explainer"].shap_values(X_eval)

        raw_expected = ML_PIPELINE["explainer"].expected_value
        if isinstance(raw_expected, (list, np.ndarray)):
            base_value = float(raw_expected[0])
        else:
            base_value = float(raw_expected)

        shap_list = [float(v) for v in shap_values[0]]
        feature_names = ML_PIPELINE["feature_names"]

        ranked_indices = np.argsort(np.abs(shap_list))[::-1]
        top_feature = feature_names[ranked_indices[0]]
        top_shap = shap_list[ranked_indices[0]]
        top_direction = "increases" if top_shap >= 0 else "reduces"

        spacing_str = f"{node_spacing:g}°"
        radius_str = f"R = {sine_radius:g}'"

        if top_feature == "distance_to_nearest_node":
            human_explanation = (
                f"Distance from the nearest {spacing_str} table node ({feats[1]:.3f}°) is the main driver "
                f"that {top_direction} the predicted error ({top_shap:+.2e}); the table's own rounded values "
                f"and its approximate radius {radius_str} also contribute."
            )
        else:
            human_explanation = (
                f"In this region of the quadrant, '{top_feature}' ({feats[ranked_indices[0]]:.3f}) is the main driver "
                f"that {top_direction} the predicted error ({top_shap:+.2e}), alongside distance from the nearest "
                f"{spacing_str} table node ({feats[1]:.3f}°); the table's own rounded values and its approximate "
                f"radius {radius_str} also contribute."
            )

        features_dict = {
            "theta": round(feats[0], 4),
            "distance_to_nearest_node": round(feats[1], 4),
            "position_in_interval": round(feats[2], 4),
            "interval_index": int(feats[3])
        }

        shap_dict = {
            feature_names[i]: round(shap_list[i], 8) for i in range(len(feature_names))
        }

        return {
            "supported": True,
            "method_id": req.method_id,
            "surrogate_model": "DecisionTreeRegressor",
            "surrogate_r2_cv": ML_PIPELINE["surrogate_r2_cv"],
            "training_r2": ML_PIPELINE["training_r2"],
            "surrogate_r2_score": ML_PIPELINE["surrogate_r2_cv"],
            "base_value": round(base_value, 8),
            "predicted_error": round(predicted_error, 8),
            "true_error": round(true_error, 8),
            "features": features_dict,
            "feature_names": feature_names,
            "shap_values": shap_dict,
            "explanation": human_explanation
        }

    except Exception:
        return {
            "supported": False,
            "reason": "inference_error",
            "method_id": req.method_id,
            "message": "AI explanation unavailable for this input"
        }