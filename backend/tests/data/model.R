library(decisionSupport)

input_estimates = estimate_read_csv("{{ csv_file_path }}")

model_function <- function(){
	# ProfitResult
	Yield_t <- Yield_kg / 1000
	Variable_Cost <- Yield_t * Cost_Per_Yield
	Cost <- Variable_Cost + Fixed_Cost
	Selling_Price <- chance_event(0.1, 1, Selling_Price_Base)
	Revenue <- Selling_Price * Yield_t
	Profit <- Revenue - Cost
	ProfitResult <- Profit

	# PriceResult
	PriceResult <- Selling_Price

	# generate list of output variables
	return(list(ProfitResult=ProfitResult, PriceResult=PriceResult))
}

mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns=10000,
		functionSyntax='plainNames')