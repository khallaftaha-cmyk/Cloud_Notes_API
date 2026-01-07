# ----------------------------------------------------------------------
# STAGE 1: Builder (Install dependencies and cache them)
# ----------------------------------------------------------------------
FROM python:3.11-slim as builder
ENV PYTHONUNBUFFERED 1
WORKDIR /install

# Copy requirements.txt first for effective Docker caching
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /install/wheels -r requirements.txt

# ----------------------------------------------------------------------
# STAGE 2: Runtime (The final, lightweight image for deployment)
# ----------------------------------------------------------------------
FROM python:3.11-slim
ENV APP_HOME /app
WORKDIR $APP_HOME

# Copy the pre-built dependencies from the builder stage
COPY --from=builder /install /usr/local/
COPY --from=builder /install/wheels /tmp/wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links /tmp/wheels -r requirements.txt \
    && rm -rf /tmp/wheels

# Copy the actual application source code
COPY . $APP_HOME

# Set the entry point (Uvicorn starts the FastAPI application)
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]