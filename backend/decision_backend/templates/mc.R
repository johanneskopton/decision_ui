library(readr)
library(decisionSupport)

input_estimates = estimate_read_csv("{{ estimates_path }}")

{{ model_function }}

mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns=10000,
		functionSyntax='plainNames')

write_csv(data.frame(mc), "{{ results_path }}")