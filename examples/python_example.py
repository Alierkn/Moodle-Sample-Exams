"""
Example Python code for Moodle Exam Simulator
This demonstrates a simple data processing task using Python
"""

def calculate_statistics(numbers):
    """
    Calculate basic statistics for a list of numbers
    Returns a dictionary with mean, median, min, max, and sum
    """
    if not numbers:
        return {
            "mean": None,
            "median": None,
            "min": None,
            "max": None,
            "sum": 0
        }
    
    # Sort the list for median calculation
    sorted_numbers = sorted(numbers)
    n = len(sorted_numbers)
    
    # Calculate median
    if n % 2 == 0:
        median = (sorted_numbers[n//2 - 1] + sorted_numbers[n//2]) / 2
    else:
        median = sorted_numbers[n//2]
    
    # Return statistics
    return {
        "mean": sum(numbers) / n,
        "median": median,
        "min": min(numbers),
        "max": max(numbers),
        "sum": sum(numbers)
    }

# Example usage
if __name__ == "__main__":
    data = [12, 5, 8, 42, 23, 16, 4, 7]
    stats = calculate_statistics(data)
    
    print(f"Data: {data}")
    print(f"Mean: {stats['mean']}")
    print(f"Median: {stats['median']}")
    print(f"Min: {stats['min']}")
    print(f"Max: {stats['max']}")
    print(f"Sum: {stats['sum']}")
    
    # Test with empty list
    empty_stats = calculate_statistics([])
    print("\nEmpty data statistics:")
    print(empty_stats)
