FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY . /usr/share/nginx/html/

# data
RUN curl "http://uvasds-data.s3-website-us-east-1.amazonaws.com/embeddings/pub_prop_author.csv" > /usr/share/nginx/html/pub_prop_author.csv

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
