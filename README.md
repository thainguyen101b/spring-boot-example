# Spring Boot Example

## OAuth2 Backend for Frontend with spring-cloud-gateway and spring-addons

#### Overview

Dự án này bao gồm

1. Keycloak v26
2. JDK 17
3. Reverse proxy (Nginx)
4. React + Vite

**Lưu ý quan trọng:**

Để tránh trường hợp Keycloak chặn origin và ném ra lỗi 403 một cách triệt để. Bạn luôn phải thêm đủ các header không
chuẩn `X-Forwarded-*`. Một trường hợp lỗi phổ biến là thiếu chỉ định `X-Forwarded-Port`, mặc dù nếu nginx reverse proxy
chạy ở port 80 thì bạn sẽ không gặp lỗi này, nhưng nếu chạy port khác, thì gặp lỗi, nên dù gì thì hãy luôn thêm header
này.

#### Nginx Reverse Proxy

```text
work_processes 1;

events {
    worker_connections 1024;
}

http {
    include         mime.types;
    default_type    application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    server {
        listen      7080;
        server_name localhost;
        
        location / {
            return 404;    
        }
        
        location /bff/ {
            proxy_pass  http://localhost:7081/;
        }
        
        location /ui {
            proxy_pass  http://localhost:5173/ui;
        }
        
        location /auth/ {
            proxy_pass  http://localhost:8080/;
            
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
        }
        
        error_page  404                 /404.html;
        location = /404.html {
            root    html;
        }
        
        error_page  500 502 503 504     /50x.html;
        location = /50x.html {
            root    html;
        }
    }
}
```

#### Keycloak

**1. CLI**

```shell
# Powershell
kc start-dev --proxy-headers xforwarded `
--bootstrap-admin-username=admin `
--bootstrap-admin-password=admin `
--hostname=http://localhost:7080/auth `
--hostname-admin=http://localhost:7080/auth `
--http-enabled=true
```

**2. Docker compose**

```yml
keycloak:
  image: quay.io/keycloak/keycloak:26.0.0
  command:
    - start-dev --proxy-headers xforwarded
  ports:
    - '8080:8080'
  environment:
    KC_BOOTSTRAP_ADMIN_USERNAME: admin
    KC_BOOTSTRAP_ADMIN_PASSWORD: admin
    KC_HOSTNAME: http://localhost:7080/auth
    KC_HOSTNAME_ADMIN: http://localhost:7080/auth
    KC_HTTP_ENABLED: true
```

**Chuẩn bị những thứ sau:**

1. realm `springbootexample`
2. confidential client `spring-boot-example`
3. redirect-uri: `http://localhost:7080/bff/login/oauth2/code/springbootexample`
4. post-logout-redirect-uri: `http://localhost:7080/ui/*`
5. web origins: `+`
6. back-channel-logout: `http://localhost:7080/bff/logout/connect/back-channel/springbootexample`

#### BFF

```yml
scheme: http
hostname: localhost
reverse-proxy-port: 7080
reverse-proxy-uri: ${scheme}://${hostname}:${reverse-proxy-port}
authorization-server-prefix: /auth
issuer: ${reverse-proxy-uri}${authorization-server-prefix}/realms/springbootexample
client-id: spring-boot-example
client-secret: IwIFSWS4L4alqhiZN6gfiGcmPDOlxMKk
authorities-json-path: $.realm_access.roles
bff-port: 7081
bff-prefix: /bff
resource-server-port: 7084

server:
  port: ${bff-port}
spring:
  application:
    name: bff
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: bff
              uri: ${scheme}://${hostname}:${resource-server-port}
              predicates:
                - Path=/api/**
              filters:
                - TokenRelay=
                - SaveSession
                - StripPrefix=1
  security:
    oauth2:
      client:
        provider:
          keycloak:
            issuer-uri: ${issuer}
        registration:
          springbootexample:
            provider: keycloak
            client-id: ${client-id}
            client-secret: ${client-secret}
            authorization-grant-type: authorization_code
            scope: openid,profile,email,offline_access
com:
  c4-soft:
    springaddons:
      oidc:
        ops:
          - iss: ${issuer}
            authorities:
              - path: ${authorities-json-path}
        client:
          client-uri: ${reverse-proxy-uri}${bff-prefix}
          security-matchers:
            - /api/**
            - /login/**
            - /oauth2/**
            - /logout/**
          permit-all:
            - /api/**
            - /login/**
            - /oauth2/**
            - /logout/connect/back-channel/springbootexample
          post-logout-redirect-host: ${hostname}
          csrf: cookie_accessible_from_js
          oauth2-redirections:
            rp-initiated-logout: accepted
          back-channel-logout:
            enabled: true
            internal-logout-uri: ${scheme}://${hostname}:${bff-port}/logout
        resourceserver:
          permit-all:
            - /login-options
```

#### Resource Server

```yml
scheme: http
hostname: localhost
reverse-proxy-port: 7080
reverse-proxy-uri: ${scheme}://${hostname}:${reverse-proxy-port}
authorization-server-prefix: /auth
issuer: ${reverse-proxy-uri}${authorization-server-prefix}/realms/springbootexample
username-claim-json-path: $.preferred_username
authorities-json-path: $.realm_access.roles
resource-server-port: 7084

server:
  port: ${resource-server-port}
spring:
  application:
    name: resource-server
com:
  c4-soft:
    springaddons:
      oidc:
        ops:
          - iss: ${issuer}
            username-claim: ${username-claim-json-path}
            authorities:
              - path: ${authorities-json-path}
        resourceserver:
          permit-all:
            - /me
```

