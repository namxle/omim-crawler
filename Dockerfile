FROM ubuntu:20.04

SHELL [ "/bin/bash", "-c" ]


RUN apt-get update -y && apt-get install -y sudo python python3 python3-pip

RUN useradd -m ubuntu && \
    usermod -aG sudo ubuntu && \
    echo '%sudo ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers && \
    cp /root/.bashrc /home/ubuntu/ && \
    mkdir /home/ubuntu/omim-crawler && \
    chown -R --from=root ubuntu /home/ubuntu
WORKDIR /home/ubuntu
ENV HOME /home/ubuntu
ENV USER ubuntu
USER ubuntu
ENV PATH /home/ubuntu/.local/bin:$PATH
# Avoid first use of sudo warning. c.f. https://askubuntu.com/a/22614/781671
RUN touch $HOME/.sudo_as_admin_successful

COPY requirements.txt .

RUN python3 -m pip install --no-cache-dir -r requirements.txt
