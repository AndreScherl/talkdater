FROM mongo:latest

ENV AUTH yes
ENV STORAGE_ENGINE wiredTiger
ENV JOURNALING yes

ENV MONGODB_ADMIN_USER admin
ENV MONGODB_ADMIN_PASS adminpass
ENV MONGODB_APPLICATION_DATABASE talkdater
ENV MONGODB_APPLICATION_USER tdadmin
ENV MONGODB_APPLICATION_PASS tdadminpass

ADD run.sh /run.sh
ADD set_mongodb_password.sh /set_mongodb_password.sh
RUN chmod +x run.sh set_mongodb_password.sh

EXPOSE 27017

CMD ["/run.sh"]