library(readr)
library(decisionSupport)

{% if is_estimate %}input_estimates <- estimate_read_csv("{{ estimates_path }}")
{% else %}# estimates can not be empty
input_estimates <- estimate(c("const"), c(0), c(0))
{% endif %}
{{ model_function }}

mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns=10000,
		functionSyntax='plainNames')

write_csv(data.frame(mc), "{{ results_path }}")