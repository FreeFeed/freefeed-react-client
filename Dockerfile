FROM node:14 as builder

RUN apt-get update && \
    apt-get install -y \
    g++ \
    git \
    make

ADD . /client
WORKDIR /client

RUN rm -rf node_modules && \
    rm -f log/*.log && \
    yarn install && \
    yarn build-prod

FROM scratch

COPY --from=builder /client/_dist /var/www/freefeed-react-client
VOLUME /var/www/freefeed-react-client
