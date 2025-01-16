# Settings

The settings page can be used to influence how a model is evaluated both in the frontend and backend.

The _frontend_ settings impact the calculations that are done inside the model editor, e.g., to show a preview of the
output distribution of a result node inside the node itself.

The _backend_ settings influence the calculations that are done when clicking on the blue rocket button in the
bottom-right corner.

The following settings are available:

## Frontend

- Histogram Bins \
  The number of histogram bins that is used to preview the distribution inside a result or histogram node in the model
  editor

- Monte Carlo Runs \
  The number of Monte Carlo runs that are performed to estimate the distribution inside a result or histogram node in
  the model editor

> Warning: Increasing the frontend Monte Carlo runs setting might make your browser unresponsive. Try to decrease
> this setting in case your browser is lagging, meaning, your browser does not immediately react to mouse clicks or
> other interactions.

## Backend

- Histogram Bins \
  The number of histogram bins that are used to generate the result diagram on the Results dashboard page.

- Monte Carlo Runs \
  The number of Monte Carlo runs that are performed to estimate the distribution of each result visualized in the
  result diagram on the Results dashboard page.

- EVPI Monte Carlo Runs \
  The number of Monte Carlo runs that are performed to estimate the Expected Value of Perfect Information (EVPI)
  visualized in the EVPI diagram on the Result dashboard page.
