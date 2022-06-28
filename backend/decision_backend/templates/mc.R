library(decisionSupport)

input_estimates = estimate_read_csv("{{ csv_file_path }}")

{{ model_function }}

mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns=10000,
		functionSyntax='plainNames')