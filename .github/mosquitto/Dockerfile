# Custom mosquitto image for CI testing
# Enables anonymous connections for test environments
FROM eclipse-mosquitto:2

# Create config directory and add anonymous access configuration
RUN mkdir -p /mosquitto/config && \
    echo "listener 1883" > /mosquitto/config/mosquitto.conf && \
    echo "allow_anonymous true" >> /mosquitto/config/mosquitto.conf && \
    echo "persistence false" >> /mosquitto/config/mosquitto.conf
