FROM python:3.12-slim

WORKDIR /app

# Run as a non-root user
RUN useradd --create-home appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Writable location for the SQLite demo db
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser

ENV NIVESHRAKSHA_DB_PATH=/app/data/niveshraksha.db

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
