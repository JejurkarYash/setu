# 1. Build the go binary 

FROM golang:1.26-alpine AS builder


WORKDIR /app

# install build dependencies 
RUN  apk add --no-cache git ca-certificates 

# copy dependencies  and downlaod them 
COPY go.mod go.sum ./
RUN go mod download

# copy source code 
COPY  . .

# compile it 
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /bin/setu ./cmd/setu/main.go


# 2. Run Binary 
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /bin/setu /app/setu 

EXPOSE 8080

CMD [ "/app/setu" ]

