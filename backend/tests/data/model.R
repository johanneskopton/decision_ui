library(readr)
library(decisionSupport)

input_estimates <- estimate_read_csv("{{ estimates_path }}")

model_function <- function(){
	# ProfitResult
	Yield_t <- Yield_kg / 1000
	Variable_Cost <- Yield_t * Cost_Per_Yield
	Cost <- Variable_Cost + Fixed_Cost
	Selling_Price <- chance_event(0.1, 1, Selling_Price_Base)
	Revenue <- Selling_Price * Yield_t
	Profit <- Revenue - Cost
	ProfitResult <- Profit

	# ProfitAltResult
	Variable_Cost_no_investment <- Variable_Cost * 5
	Profit_2 <- Revenue - Variable_Cost_no_investment
	ProfitAltResult <- Profit_2

	# generate list of output variables
	return(list(ProfitResult=ProfitResult, ProfitAltResult=ProfitAltResult))
}

mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns=100,
		functionSyntax='plainNames')


write_csv(data.frame(mc["y"]), "{{ results_path }}")