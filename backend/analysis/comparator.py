# project_root/backend/analysis/comparator.py

def calculate_error(ancient_value: float, modern_value: float) -> dict:
    """
    Calculates the absolute and relative error between the ancient approximation
    and the modern standard value.
    """
    absolute_error = abs(modern_value - ancient_value)
    
    if modern_value == 0:
        relative_error = 0.0
    else:
        relative_error = (absolute_error / abs(modern_value)) * 100
        
    return {
        "modern_value": modern_value,
        "ancient_value": ancient_value,
        "absolute_error": absolute_error,
        "relative_error_percentage": relative_error,
        "accuracy_percentage": max(0.0, 100 - relative_error)
    }