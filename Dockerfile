# Dockerfile para Frontend do Sistema Veterinário
# Multi-stage build com Nginx para produção

# Stage 1: Build
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build

# Stage 2: Production com Nginx
FROM nginx:alpine AS production

# Instalar dumb-init para melhor gerenciamento de processos
RUN apk add --no-cache dumb-init

# Remover configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configurações customizadas do nginx
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Criar usuário não-root (se não existir)
RUN if ! getent group nginx > /dev/null 2>&1; then addgroup -g 1001 -S nginx; fi && \
    if ! getent passwd nginx > /dev/null 2>&1; then adduser -S nginx -u 1001 -G nginx; fi

# Ajustar permissões para usuário não-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    mkdir -p /tmp && \
    chown -R nginx:nginx /tmp && \
    chmod 755 /tmp

# Mudar para usuário não-root
USER nginx

# Expor porta não-privilegiada
EXPOSE 8080

# Health check na porta correta
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
