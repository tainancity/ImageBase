#!/bin/bash
#
# 功能：備份 Redis 中的 /var/lib/redis/dump.rdb 資料庫
# 並壓縮至 /root/backup 資料夾底下，並以日期做區隔

########################每日備份/分割區###########################################################
date1=$(date +%F)

redis_backup="redis-"$date1".tar.gz"
#etc_backup="etc-"$date1".tar.gz"



#######################產生各個檔案##############################################################
tar -cvzf /root/backup/$redis_backup -C /var/lib/redis dump.rdb
