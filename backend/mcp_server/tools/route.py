from typing import List, Dict, Any

def route(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Groups and orders lab results by severity.
    Order: Critical -> Warning -> Normal -> Unknown
    """
    groups = {
        "critical": [],
        "warning": [],
        "normal": [],
        "unknown": []
    }
    
    for r in results:
        status = r.get("status", "Unknown").lower()
        if status in groups:
            groups[status].append(r)
        else:
            groups["unknown"].append(r)
            
    summary = {
        "critical": len(groups["critical"]),
        "warning": len(groups["warning"]),
        "normal": len(groups["normal"]),
        "unknown": len(groups["unknown"]),
        "total": len(results)
    }
    
    # Flat list: critical, then warning, then normal, then unknown
    ordered = groups["critical"] + groups["warning"] + groups["normal"] + groups["unknown"]
    
    return {
        "summary": summary,
        "results_by_severity": groups,
        "ordered_results": ordered
    }
