library(readr)
library(decisionSupport)

{% if is_estimate %}input_estimates <- estimate_read_csv("{{ estimates_path }}")
{% else %}# estimates can not be empty
input_estimates <- estimate(c("const"), c(0), c(0))
{% endif %}
{{ model_function }}

mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns={{mc_runs}},
		functionSyntax='plainNames')

{% if do_evpi %}first_out_var <- colnames(mc$y)[1]
mc_table <- data.frame(mc$x, mc$y)
evpi <- multi_EVPI(mc=mc_table, first_out_var = first_out_var, write_table = FALSE, outfolder = NA)
evpi_res = data.frame(variable = evpi[[1]]$variable)
for (i in 1:length(evpi)){
  evpi_res[names(evpi)[i]] = evpi[[i]]$EVPI
}
write_csv(evpi_res, "{{ evpi_path }}")
{% endif %}
write_csv(data.frame(mc["y"]), "{{ results_path }}")