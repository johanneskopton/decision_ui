# Decision UI Backend

Backend using the decisionSupport R package.

## Installation

```bash
# install for production
pip install .

# install in place for development incl dev dependencies
pip install -e .[dev]
```

## Testing

```bash
# run all tests
pytest
```

## Serve for development

```bash
# start uvicorn ASGI server with hot reload at localhost:8000
uvicorn decision_backend.main:app --reload
```
