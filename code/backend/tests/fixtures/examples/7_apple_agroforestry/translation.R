model_function <- function(){
	# subgraph NPV 10-year
	NPV_10year <- function(Discount, Sample){
		# Subgraph Output
		To_Series <- rep(Sample, 10)
		Net_Present_Value <- discount(To_Series, Discount, calculate_NPV=TRUE)
		NPV <- Net_Present_Value
		
		return(list(NPV=NPV))
	}

	# subgraph Decision
	Decision <- function(Apple_Costs, Apple_Income, Discount, Sheep_Costs, Sheep_Income){
		# Subgraph Output
		Total_Income <- Sheep_Income + Apple_Income
		Total_Costs <- Sheep_Costs + Apple_Costs
		Total_Gain <- Total_Income - Total_Costs
		NPV_10year_list <- NPV_10year(Discount, Total_Gain)
		Both_NPV <- NPV_10year_list$NPV
		
		# Subgraph Output
		Sheep_Only_Gain <- Sheep_Income - Sheep_Costs
		NPV_10year_list_2 <- NPV_10year(Discount, Sheep_Only_Gain)
		Sheep_Only_NPV <- NPV_10year_list_2$NPV
		
		# Subgraph Output
		Decision_Benefit <- Total_Gain - Sheep_Only_Gain
		NPV_10year_list_3 <- NPV_10year(Discount, Decision_Benefit)
		Decision_Benefit_NPV <- NPV_10year_list_3$NPV
		
		return(list(Both_NPV=Both_NPV, Decision_Benefit_NPV=Decision_Benefit_NPV, Sheep_Only_NPV=Sheep_Only_NPV))
	}

	# Both
	Decision_list <- Decision(Apple_Costs, Apple_Income, Discount, Sheep_Costs, Sheep_Income)
	Both <- Decision_list$Both_NPV
	
	# Sheep Only
	Sheep_Only <- Decision_list$Sheep_Only_NPV
	
	# Decision Benefit
	Decision_Benefit <- Decision_list$Decision_Benefit_NPV
	
	# generate list of output variables
	return(list(Both=Both, Decision_Benefit=Decision_Benefit, Sheep_Only=Sheep_Only))
}
