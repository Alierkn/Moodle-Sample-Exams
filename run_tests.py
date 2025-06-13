#!/usr/bin/env python3
"""
Test Runner for MoodleExamSimulator

This script runs all tests for the MoodleExamSimulator system and generates
a comprehensive test report. It includes unit tests, integration tests,
and performance tests. It validates required services are running before
executing tests to avoid unnecessary failures.
"""

import os
import sys
import time
import socket
import logging
import argparse
import subprocess
import json
import urllib.request
from datetime import datetime
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('test_runner.log')
    ]
)
logger = logging.getLogger('test_runner')

def setup_test_environment():
    """Set up the test environment with necessary variables."""
    # Load from .env file if it exists
    try:
        from dotenv import load_dotenv
        load_dotenv()
        logger.info("Loaded environment variables from .env file")
    except ImportError:
        logger.warning("python-dotenv not installed, skipping .env file loading")
    
    test_env = os.environ.copy()
    
    # Define default test-specific environment variables
    default_env = {
        'TESTING': 'true',
        'LOG_LEVEL': 'INFO',
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'CACHE_TTL': '300',
        'MAX_RETRIES': '3',
        'RETRY_DELAY': '100',
        'MAX_DELAY': '5000',
        'POOL_SIZE': '5',
        'MAX_OVERFLOW': '10',
        'POOL_TIMEOUT': '30',
        'POOL_RECYCLE': '1800',
        'MONGO_HOST': 'localhost',
        'MONGO_PORT': '27017',
        'NEO4J_HOST': 'localhost',
        'NEO4J_PORT': '7687',
        'NEO4J_USER': 'neo4j',
        'NEO4J_PASSWORD': 'password',
        'MYSQL_HOST': 'localhost',
        'MYSQL_PORT': '3306',
        'MYSQL_USER': 'test',
        'MYSQL_PASSWORD': 'test',
        'MYSQL_DATABASE': 'test',
        'SUPABASE_URL': test_env.get('SUPABASE_URL', ''),
        'SUPABASE_KEY': test_env.get('SUPABASE_KEY', ''),
        'PERF_DB_CONN_THRESHOLD': '0.01',
        'PERF_RETRY_THRESHOLD': '0.01', 
        'PERF_CACHE_IMPROVEMENT_FACTOR': '1.5'
    }
    
    # Only update with defaults if not already present in environment
    for key, value in default_env.items():
        if key not in test_env or not test_env[key]:
            test_env[key] = value
    
    return test_env

def check_service_availability(services=None):
    """Check if the required services are available before running tests.
    
    Args:
        services: List of services to check, or None to check all
        
    Returns:
        dict: Status of each service (True if available, False otherwise)
    """
    all_services = {
        'mongodb': {'host': os.environ.get('MONGO_HOST', 'localhost'), 
                  'port': int(os.environ.get('MONGO_PORT', 27017))},
        'mysql': {'host': os.environ.get('MYSQL_HOST', 'localhost'), 
                 'port': int(os.environ.get('MYSQL_PORT', 3306))},
        'neo4j': {'host': os.environ.get('NEO4J_HOST', 'localhost'), 
                 'port': int(os.environ.get('NEO4J_PORT', 7687))},
    }
    
    # If no specific services specified, check all
    if services is None:
        services = list(all_services.keys())
    
    # Filter only requested services
    check_services = {k: v for k, v in all_services.items() if k in services}
    
    results = {}
    for service_name, config in check_services.items():
        logger.info(f"Checking if {service_name} is available at {config['host']}:{config['port']}...")
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)  # 2 second timeout
            result = sock.connect_ex((config['host'], config['port']))
            sock.close()
            
            available = (result == 0)
            results[service_name] = available
            if available:
                logger.info(f"✅ {service_name} is available")
            else:
                logger.warning(f"❌ {service_name} is not available")
        except Exception as e:
            logger.error(f"Error checking {service_name}: {e}")
            results[service_name] = False
    
    # Check if Supabase is accessible if URL is provided
    if 'supabase' in services and os.environ.get('SUPABASE_URL'):
        try:
            # Just try to connect to the domain, don't make an actual API call
            url = os.environ.get('SUPABASE_URL')
            parsed_url = urllib.parse.urlparse(url)
            domain = parsed_url.netloc
            
            # Try to resolve the hostname
            socket.gethostbyname(domain)
            logger.info("✅ Supabase domain is resolvable")
            results['supabase'] = True
        except Exception as e:
            logger.warning(f"❌ Supabase is not accessible: {e}")
            results['supabase'] = False
    
    return results

def run_unit_tests(test_env, output_dir, verbose=False):
    """Run unit tests using pytest."""
    print("Running unit tests...")
    
    # Create command
    cmd = [
        "python", "-m", "pytest",
        "tests/test_db_manager.py",
        "tests/test_health_api.py",
        "tests/test_retry_manager.py",
        "-v" if verbose else "-q",
        f"--junitxml={output_dir}/unit_tests.xml",
        "--cov=.",
        f"--cov-report=xml:{output_dir}/coverage.xml",
        f"--cov-report=html:{output_dir}/coverage_html"
    ]
    
    # Run the tests
    start_time = time.time()
    result = subprocess.run(cmd, env=test_env, capture_output=True, text=True)
    duration = time.time() - start_time
    
    # Save output
    with open(f"{output_dir}/unit_tests_output.txt", "w") as f:
        f.write(result.stdout)
        if result.stderr:
            f.write("\n\nERRORS:\n")
            f.write(result.stderr)
    
    return {
        "success": result.returncode == 0,
        "duration": duration,
        "output_file": f"{output_dir}/unit_tests_output.txt",
        "returncode": result.returncode
    }

def run_performance_tests(test_env, output_dir, verbose=False):
    """Run performance tests."""
    print("Running performance tests...")
    
    # Create command
    cmd = [
        "python", "-m", "pytest",
        "tests/performance/test_performance.py",
        "-v" if verbose else "-q",
        f"--junitxml={output_dir}/performance_tests.xml"
    ]
    
    # Run the tests
    start_time = time.time()
    result = subprocess.run(cmd, env=test_env, capture_output=True, text=True)
    duration = time.time() - start_time
    
    # Save output
    with open(f"{output_dir}/performance_tests_output.txt", "w") as f:
        f.write(result.stdout)
        if result.stderr:
            f.write("\n\nERRORS:\n")
            f.write(result.stderr)
    
    return {
        "success": result.returncode == 0,
        "duration": duration,
        "output_file": f"{output_dir}/performance_tests_output.txt",
        "returncode": result.returncode
    }

def run_linting(output_dir):
    """Run code linting with flake8."""
    print("Running code linting...")
    
    # Create command
    cmd = [
        "flake8",
        "--max-line-length=100",
        "--exclude=venv,__pycache__,.git,*.pyc",
        "."
    ]
    
    # Run the linting
    start_time = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True)
    duration = time.time() - start_time
    
    # Save output
    with open(f"{output_dir}/linting_output.txt", "w") as f:
        if result.stdout:
            f.write(result.stdout)
        else:
            f.write("No linting issues found.")
        if result.stderr:
            f.write("\n\nERRORS:\n")
            f.write(result.stderr)
    
    return {
        "success": result.returncode == 0,
        "duration": duration,
        "output_file": f"{output_dir}/linting_output.txt",
        "returncode": result.returncode
    }

def generate_report(results, output_dir, service_status=None):
    """Generate a comprehensive test report."""
    print("Generating test report...")
    
    # Create report data
    summary = {}
    
    # Add service status if available
    if service_status:
        summary["services"] = {
            "all_available": all(service_status.values()),
            "details": service_status
        }
    
    # Add test results to summary
    for test_type, result in results.items():
        if isinstance(result, dict) and "success" in result:
            summary[test_type] = result["success"]
    
    # Calculate overall success
    test_results = [r["success"] for r in results.values() if isinstance(r, dict) and "success" in r]
    overall_success = all(test_results) if test_results else False
    
    # If services are checked and unavailable, note that in the report
    if service_status and not all(service_status.values()):
        unavailable = [svc for svc, status in service_status.items() if not status]
        logger.warning(f"Tests ran with unavailable services: {', '.join(unavailable)}")
    
    summary["overall_success"] = overall_success
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": summary,
        "details": results
    }
    
    # Save report as JSON
    with open(f"{output_dir}/test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    # Generate HTML report
    html_report = f"""<!DOCTYPE html>
<html>
<head>
    <title>MoodleExamSimulator Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1, h2 {{ color: #333; }}
        .success {{ color: green; }}
        .failure {{ color: red; }}
        .section {{ margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <h1>MoodleExamSimulator Test Report</h1>
    <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    
    <div class="section">
        <h2>Summary</h2>
        <p>Overall Status: <span class="{'success' if report['summary']['overall_success'] else 'failure'}">
            {'PASSED' if report['summary']['overall_success'] else 'FAILED'}
        </span></p>
        <table>
            <tr>
                <th>Test Type</th>
                <th>Status</th>
                <th>Duration (s)</th>
            </tr>
            <tr>
                <td>Unit Tests</td>
                <td class="{'success' if results['unit_tests']['success'] else 'failure'}">
                    {'PASSED' if results['unit_tests']['success'] else 'FAILED'}
                </td>
                <td>{results['unit_tests']['duration']:.2f}</td>
            </tr>
            <tr>
                <td>Performance Tests</td>
                <td class="{'success' if results['performance_tests']['success'] else 'failure'}">
                    {'PASSED' if results['performance_tests']['success'] else 'FAILED'}
                </td>
                <td>{results['performance_tests']['duration']:.2f}</td>
            </tr>
            <tr>
                <td>Linting</td>
                <td class="{'success' if results['linting']['success'] else 'failure'}">
                    {'PASSED' if results['linting']['success'] else 'FAILED'}
                </td>
                <td>{results['linting']['duration']:.2f}</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>Details</h2>
        <p>See the output files for detailed test results:</p>
        <ul>
            <li><a href="unit_tests_output.txt">Unit Tests Output</a></li>
            <li><a href="performance_tests_output.txt">Performance Tests Output</a></li>
            <li><a href="linting_output.txt">Linting Output</a></li>
            <li><a href="coverage_html/index.html">Coverage Report</a></li>
        </ul>
    </div>
</body>
</html>
    """
    
    # Save HTML report
    with open(f"{output_dir}/test_report.html", "w") as f:
        f.write(html_report)
    
    print(f"Test report generated at {output_dir}/test_report.html")
    
    return report

def main():
    """Main function to run tests and generate report."""
    parser = argparse.ArgumentParser(description="Run tests for MoodleExamSimulator")
    parser.add_argument("--output-dir", default="test_results", help="Directory to store test results")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    parser.add_argument("--skip-unit", action="store_true", help="Skip unit tests")
    parser.add_argument("--skip-performance", action="store_true", help="Skip performance tests")
    parser.add_argument("--skip-linting", action="store_true", help="Skip linting")
    parser.add_argument("--skip-service-check", action="store_true", help="Skip service availability check")
    parser.add_argument("--services", nargs="+", choices=["mongodb", "mysql", "neo4j", "supabase"], 
                        help="Specific services to check availability for")
    parser.add_argument("--continue-on-service-unavailable", action="store_true", 
                        help="Continue even if services are unavailable")
    args = parser.parse_args()
    
    # Create output directory
    output_dir = args.output_dir
    os.makedirs(output_dir, exist_ok=True)
    
    # Set up test environment
    test_env = setup_test_environment()
    
    # Check services availability
    service_status = {}
    if not args.skip_service_check:
        service_status = check_service_availability(args.services)
        all_available = all(service_status.values())
        if not all_available and not args.continue_on_service_unavailable:
            logger.error("Some required services are not available. Use --continue-on-service-unavailable to force test execution.")
            unavailable = [svc for svc, status in service_status.items() if not status]
            logger.error(f"Unavailable services: {', '.join(unavailable)}")
            return 1
    
    # Initialize results
    results = {"service_check": {"success": all(service_status.values()) if service_status else True}}
    
    # Run tests
    if not args.skip_unit:
        results["unit_tests"] = run_unit_tests(test_env, output_dir, args.verbose)
    else:
        print("Skipping unit tests...")
        results["unit_tests"] = {"success": True, "duration": 0, "skipped": True}
    
    if not args.skip_performance:
        results["performance_tests"] = run_performance_tests(test_env, output_dir, args.verbose)
    else:
        print("Skipping performance tests...")
        results["performance_tests"] = {"success": True, "duration": 0, "skipped": True}
    
    if not args.skip_linting:
        results["linting"] = run_linting(output_dir)
    else:
        print("Skipping linting...")
        results["linting"] = {"success": True, "duration": 0, "skipped": True}
    
    # Generate report
    report = generate_report(results, output_dir, service_status)
    
    # Print summary
    print("\nTest Summary:")
    if service_status:
        unavailable = [svc for svc, status in service_status.items() if not status]
        if unavailable:
            print(f"Services Unavailable: {', '.join(unavailable)}")
    print(f"Unit Tests: {'SKIPPED' if args.skip_unit else 'PASSED' if results.get('unit_tests', {}).get('success', False) else 'FAILED'}")
    print(f"Performance Tests: {'SKIPPED' if args.skip_performance else 'PASSED' if results.get('performance_tests', {}).get('success', False) else 'FAILED'}")
    print(f"Linting: {'SKIPPED' if args.skip_linting else 'PASSED' if results.get('linting', {}).get('success', False) else 'FAILED'}")
    print(f"Overall: {'PASSED' if report['summary']['overall_success'] else 'FAILED'}")
    
    # Return exit code
    return 0 if report["summary"]["overall_success"] else 1

if __name__ == "__main__":
    sys.exit(main())
