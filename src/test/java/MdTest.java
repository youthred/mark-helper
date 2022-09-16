import cn.hutool.core.io.FileUtil;
import org.junit.Test;

public class MdTest {

    private static final String md = "---\n" +
            "layout: post\n" +
            "title: \"Centos7下MySQL8彻底卸载及安装\"\n" +
            "subtitle: \"\"\n" +
            "date: 2021-04-15 00:00:00\n" +
            "author: youthred\n" +
            "header-img: \"img/jk-siwa.png\"\n" +
            "catalog: true\n" +
            "tags: [CentOS,MySQL]\n" +
            "---\n" +
            "\n" +
            "[TOC]\n\n" +
            "- [x] dd\n" +
            "- [ ] xxx\n" +
            "\n" +
            "## 首先升级yum `yum update`\n" +
            "\n" +
            "## 查看已安装的MySQL\n" +
            "\n" +
            "``` shell\n" +
            "[root@centos7 ~]# rpm -qa | grep -i mysql\n" +
            "mysql80-community-release-el7-3.noarch\n" +
            "mysql-community-client-8.0.22-1.el7.x86_64\n" +
            "mysql-community-common-8.0.22-1.el7.x86_64\n" +
            "mysql-community-server-8.0.22-1.el7.x86_64\n" +
            "mysql-community-client-plugins-8.0.22-1.el7.x86_64\n" +
            "mysql-community-libs-8.0.22-1.el7.x86_64\n" +
            "```\n" +
            "\n" +
            "## 卸载\n" +
            "\n" +
            "``` shell\n" +
            "[root@centos7 ~]# yum remove -y mysql*\n" +
            "Loaded plugins: fastestmirror, product-id, search-disabled-repos, subscription-manager\n" +
            "\n" +
            "This system is not registered with an entitlement server. You can use subscription-manager to register.\n" +
            "\n" +
            "No Match for argument: mysql80-community-release-el7-3.noarch.rpm\n" +
            "No Packages marked for removal\n" +
            "```\n" +
            "\n" +
            "有可能碰到上面所示的提示，此时先卸载“mysql80-community-release-el7-3.noarch”\n" +
            "\n" +
            "``` shell\n" +
            "[root@centos7 ~]# yum -y remove mysql80-community-release-el7-3.noarch\n" +
            "Loaded plugins: fastestmirror, product-id, search-disabled-repos, subscription-manager\n" +
            "\n" +
            "This system is not registered with an entitlement server. You can use subscription-manager to register.\n" +
            "\n" +
            "Resolving Dependencies\n" +
            "--> Running transaction check\n" +
            "---> Package mysql80-community-release.noarch 0:el7-3 will be erased\n" +
            "--> Finished Dependency Resolution\n" +
            "\n" +
            "Dependencies Resolved\n" +
            "\n" +
            "============================================================================================================================================================================================================================================================================================================================================\n" +
            " Package                                                                                        Arch                                                                        Version                                                                    Repository                                                                      Size\n" +
            "============================================================================================================================================================================================================================================================================================================================================\n" +
            "Removing:\n" +
            " mysql80-community-release                                                                      noarch                                                                      el7-3                                                                      installed                                                                       31 k\n" +
            "\n" +
            "Transaction Summary\n" +
            "============================================================================================================================================================================================================================================================================================================================================\n" +
            "Remove  1 Package\n" +
            "\n" +
            "Installed size: 31 k\n" +
            "Downloading packages:\n" +
            "Running transaction check\n" +
            "Running transaction test\n" +
            "Transaction test succeeded\n" +
            "Running transaction\n" +
            "  Erasing    : mysql80-community-release-el7-3.noarch                                                                                                                                                                                                                                                                                   1/1\n" +
            "  Verifying  : mysql80-community-release-el7-3.noarch                                                                                                                                                                                                                                                                                   1/1\n" +
            "\n" +
            "Removed:\n" +
            "  mysql80-community-release.noarch 0:el7-3\n" +
            "\n" +
            "Complete!\n" +
            "\n" +
            "```\n" +
            "\n" +
            "再卸载其他\n" +
            "\n" +
            "``` shell\n" +
            "[root@centos7 ~]# yum -y remove mysql-*\n" +
            "Loaded plugins: fastestmirror, product-id, search-disabled-repos, subscription-manager\n" +
            "\n" +
            "This system is not registered with an entitlement server. You can use subscription-manager to register.\n" +
            "\n" +
            "Resolving Dependencies\n" +
            "--> Running transaction check\n" +
            "---> Package mysql-community-client.x86_64 0:8.0.22-1.el7 will be erased\n" +
            "---> Package mysql-community-client-plugins.x86_64 0:8.0.22-1.el7 will be erased\n" +
            "---> Package mysql-community-common.x86_64 0:8.0.22-1.el7 will be erased\n" +
            "---> Package mysql-community-libs.x86_64 0:8.0.22-1.el7 will be erased\n" +
            "---> Package mysql-community-server.x86_64 0:8.0.22-1.el7 will be erased\n" +
            "--> Finished Dependency Resolution\n" +
            "\n" +
            "Dependencies Resolved\n" +
            "\n" +
            "============================================================================================================================================================================================================================================================================================================================================\n" +
            " Package                                                                                       Arch                                                                  Version                                                                        Repository                                                                         Size\n" +
            "============================================================================================================================================================================================================================================================================================================================================\n" +
            "Removing:\n" +
            " mysql-community-client                                                                        x86_64                                                                8.0.22-1.el7                                                                   @mysql80-community                                                                230 M\n" +
            " mysql-community-client-plugins                                                                x86_64                                                                8.0.22-1.el7                                                                   @mysql80-community                                                                1.0 M\n" +
            " mysql-community-common                                                                        x86_64                                                                8.0.22-1.el7                                                                   @mysql80-community                                                                8.9 M\n" +
            " mysql-community-libs                                                                          x86_64                                                                8.0.22-1.el7                                                                   @mysql80-community                                                                 22 M\n" +
            " mysql-community-server                                                                        x86_64                                                                8.0.22-1.el7                                                                   @mysql80-community                                                                2.3 G\n" +
            "\n" +
            "Transaction Summary\n" +
            "============================================================================================================================================================================================================================================================================================================================================\n" +
            "Remove  5 Packages\n" +
            "\n" +
            "Installed size: 2.6 G\n" +
            "Downloading packages:\n" +
            "Running transaction check\n" +
            "Running transaction test\n" +
            "Transaction test succeeded\n" +
            "Running transaction\n" +
            "  Erasing    : mysql-community-server-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                               1/5\n" +
            "  Erasing    : mysql-community-client-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                               2/5\n" +
            "  Erasing    : mysql-community-libs-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                                 3/5\n" +
            "  Erasing    : mysql-community-common-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                               4/5\n" +
            "  Erasing    : mysql-community-client-plugins-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                       5/5\n" +
            "  Verifying  : mysql-community-client-plugins-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                       1/5\n" +
            "  Verifying  : mysql-community-common-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                               2/5\n" +
            "  Verifying  : mysql-community-client-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                               3/5\n" +
            "  Verifying  : mysql-community-libs-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                                 4/5\n" +
            "  Verifying  : mysql-community-server-8.0.22-1.el7.x86_64                                                                                                                                                                                                                                                                               5/5\n" +
            "\n" +
            "Removed:\n" +
            "  mysql-community-client.x86_64 0:8.0.22-1.el7                     mysql-community-client-plugins.x86_64 0:8.0.22-1.el7                     mysql-community-common.x86_64 0:8.0.22-1.el7                     mysql-community-libs.x86_64 0:8.0.22-1.el7                     mysql-community-server.x86_64 0:8.0.22-1.el7\n" +
            "\n" +
            "Complete!\n" +
            "```\n" +
            "\n" +
            "删除剩余的MySQL相关文件和文件夹\n" +
            "\n" +
            "``` shell\n" +
            "[root@centos7 ~]# find / -name mysql\n" +
            "```\n" +
            "\n" +
            "## 重新安装\n" +
            "\n" +
            "CentOS7好像没有MySQL的源，取而代之是内部集成的MariaDB。[官网下载](https://dev.mysql.com/downloads/repo/yum/)MySQL的RPM源，安装成功后会自动覆盖MariaDB。下载完成后上传到服务器。\n" +
            "\n" +
            "``` shell\n" +
            "-rw-r--r-- 1 root root 26024 Jan  3 17:46 mysql80-community-release-el7-3.noarch.rpm\n" +
            "```\n" +
            "\n" +
            "### 安装repo并更新yum缓存\n" +
            "\n" +
            "``` shell\n" +
            "rpm -ivh mysql80-community-release-el7-3.noarch.rpm\n" +
            "```\n" +
            "\n" +
            "执行后会在`/etc/yum.repos.d/`下生成两个repo文件\n" +
            "\n" +
            "``` shell\n" +
            "[root@centos7 ~]# ll /etc/yum.repos.d/ | grep mysql\n" +
            "-rw-r--r-- 1 root root 2076 Apr 25  2019 mysql-community.repo\n" +
            "-rw-r--r-- 1 root root 2108 Apr 25  2019 mysql-community-source.repo\n" +
            "```\n" +
            "\n" +
            "### 刷新yum\n" +
            "\n" +
            "``` shell\n" +
            "yum clean all | yum makecache\n" +
            "```\n" +
            "\n" +
            "### 查看yum中的MySQL版本\n" +
            "\n" +
            "``` shell\n" +
            "[root@centos7 ~]# yum repolist all | grep mysql\n" +
            "mysql-cluster-7.5-community/x86_64        MySQL Cluster 7.5 Comm disabled\n" +
            "mysql-cluster-7.5-community-source        MySQL Cluster 7.5 Comm disabled\n" +
            "mysql-cluster-7.6-community/x86_64        MySQL Cluster 7.6 Comm disabled\n" +
            "mysql-cluster-7.6-community-source        MySQL Cluster 7.6 Comm disabled\n" +
            "mysql-cluster-8.0-community/x86_64        MySQL Cluster 8.0 Comm disabled\n" +
            "mysql-cluster-8.0-community-source        MySQL Cluster 8.0 Comm disabled\n" +
            "mysql-connectors-community/x86_64         MySQL Connectors Commu enabled:    175\n" +
            "mysql-connectors-community-source         MySQL Connectors Commu disabled\n" +
            "mysql-tools-community/x86_64              MySQL Tools Community  enabled:    120\n" +
            "mysql-tools-community-source              MySQL Tools Community  disabled\n" +
            "mysql-tools-preview/x86_64                MySQL Tools Preview    disabled\n" +
            "mysql-tools-preview-source                MySQL Tools Preview -  disabled\n" +
            "mysql55-community/x86_64                  MySQL 5.5 Community Se disabled\n" +
            "mysql55-community-source                  MySQL 5.5 Community Se disabled\n" +
            "mysql56-community/x86_64                  MySQL 5.6 Community Se disabled\n" +
            "mysql56-community-source                  MySQL 5.6 Community Se disabled\n" +
            "mysql57-community/x86_64                  MySQL 5.7 Community Se disabled\n" +
            "mysql57-community-source                  MySQL 5.7 Community Se disabled\n" +
            "mysql80-community/x86_64                  MySQL 8.0 Community Se enabled:    211\n" +
            "mysql80-community-source                  MySQL 8.0 Community Se disabled\n" +
            "```\n" +
            "\n" +
            "MySQL8已启用\n" +
            "\n" +
            "可用命令`yum-config-manager --disable mysql80-community`或`yum-config-manager --enable mysql80-community`管理状态\n" +
            "\n" +
            "或直接编辑`/etc/yum.repos.d/mysql-community.repo`\n" +
            "\n" +
            "### 开始安装MySQL\n" +
            "\n" +
            "``` shell\n" +
            "yum -y install mysql-community-server\n" +
            "```\n" +
            "\n" +
            "完成后开启服务\n" +
            "\n" +
            "``` shell\n" +
            "systemctl start mysqld\n" +
            "```\n" +
            "\n" +
            "设置开机自启\n" +
            "\n" +
            "``` shell\n" +
            "systemctl enable mysqld\n" +
            "```\n" +
            "\n" +
            "### 登录MySQL\n" +
            "\n" +
            "查看初始密码\n" +
            "\n" +
            "``` shell\n" +
            "[root@centos7 ~]# grep 'temporary password' /var/log/mysqld.log\n" +
            "2021-01-03T09:56:56.709802Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: Mu6Vr.s1EwsB\n" +
            "```\n" +
            "\n" +
            "登录\n" +
            "\n" +
            "``` shell\n" +
            "mysql -uroot -pMu6Vr.s1EwsB\n" +
            "```\n" +
            "\n" +
            "修改密码\n" +
            "\n" +
            "```sql\n" +
            "ALTER USER 'root'@'localhost' IDENTIFIED BY 'custom-password';\n" +
            "```\n" +
            "\n" +
            "若要远程连接\n" +
            "\n" +
            "``` sql\n" +
            "-- 创建一个可以远程登陆的root用户\n" +
            "CREATE USER 'jojo'@'%' IDENTIFIED WITH mysql_native_password BY 'CUSTOM-PASSWORD';\n" +
            "```\n" +
            "\n" +
            "``` sql\n" +
            "--- 为账户开放权限\n" +
            "grant all privileges on *.* to 'jojo'@'%';\n" +
            "flush privileges;\n" +
            "```\n" +
            "\n" +
            "## 放行端口\n" +
            "\n" +
            "### 使用CentOS7默认的firewall\n" +
            "\n" +
            "开启firewalld\n" +
            "\n" +
            "``` shell\n" +
            "systemctl start firewalld | systemctl enable firewalld\n" +
            "```\n" +
            "\n" +
            "永久开放端口3306\n" +
            "\n" +
            "``` shell\n" +
            "firewall-cmd --permanent --zone=public --add-port=3306/tcp\n" +
            "```\n" +
            "\n" +
            "重新加载使之生效\n" +
            "\n" +
            "``` shell\n" +
            "firewall-cmd --reload\n" +
            "```\n" +
            "\n" +
            "查看当前开放的端口\n" +
            "\n" +
            "```  shell\n" +
            "firewall-cmd --permanent --zone=public --list-ports\n" +
            "```\n" +
            "\n" +
            "### 或者使用iptables\n" +
            "\n" +
            "关闭firewalld服务\n" +
            "\n" +
            "``` shell\n" +
            "systemctl stop firewalld | systemctl disable firewalld | systemctl mask firewalld\n" +
            "```\n" +
            "\n" +
            "没有安装iptables之前`/etc/sysconfig/`下是没有`iptables`文件的，所有要先安装iptables\n" +
            "\n" +
            "``` shell\n" +
            "yum -y install iptables-services\n" +
            "```\n" +
            "\n" +
            "启动iptables服务\n" +
            "\n" +
            "``` shell\n" +
            "systemctl enable iptables | systemctl start iptables\n" +
            "```\n" +
            "\n" +
            "推荐直接`vim`编辑`/etc/sysconfig/iptables`\n" +
            "\n" +
            "``` shell\n" +
            "# sample configuration for iptables service\n" +
            "# you can edit this manually or use system-config-firewall\n" +
            "# please do not ask us to add additional ports/services to this default configuration\n" +
            "*filter\n" +
            ":INPUT ACCEPT [0:0]\n" +
            ":FORWARD ACCEPT [0:0]\n" +
            ":OUTPUT ACCEPT [0:0]\n" +
            "-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT\n" +
            "-A INPUT -p icmp -j ACCEPT\n" +
            "-A INPUT -i lo -j ACCEPT\n" +
            "-A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT\n" +
            "-A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT\n" +
            "-A INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT\n" +
            "-A INPUT -p tcp -m state --state NEW -m tcp --dport 3306 -j ACCEPT\n" +
            "-A INPUT -p tcp -m state --state NEW -m tcp --dport 3389 -j ACCEPT\n" +
            "-A INPUT -p tcp -m state --state NEW -m tcp --dport 1000 -j ACCEPT\n" +
            "-A INPUT -j REJECT --reject-with icmp-host-prohibited\n" +
            "-A FORWARD -j REJECT --reject-with icmp-host-prohibited\n" +
            "COMMIT\n" +
            "```\n" +
            "\n" +
            "重启iptables\n" +
            "\n" +
            "``` shell\n" +
            "systemctl restart iptables\n" +
            "```\n";
    private static final String mdTable = "---\n" +
            "layout: post\n" +
            "title: \"MySQL UTF-8 常用字符排序规则\"\n" +
            "# subtitle: \"\"\n" +
            "date: 2021-04-15 11:22:28\n" +
            "author: youthred\n" +
            "header-img: \"img/jk-siwa.png\"\n" +
            "catalog: true\n" +
            "tags: [MySQL]\n" +
            "---\n" +
            "\n" +
            "| 排序规则        | 解释                                                         |\n" +
            "| --------------- | ------------------------------------------------------------ |\n" +
            "| utf8_general_ci | 不区分大小写                                                 |\n" +
            "| utf8_general_cs | 区分大小写                                                   |\n" +
            "| utf8_bin        | 区分大小写，字符串每个字符串用二进制数据编译存储，且支持存储二进制数据 |";

    @Test
    public void render() {
//        System.out.println(MdUtil.genDirTocHtmlExt("C:\\Users\\youthred\\Desktop\\a", true));
//        System.out.println(FileUtil.getPrefix("C:\\Users\\youthred\\Desktop\\a"));
//        RenderUtil.render("C:\\Users\\youthred\\Desktop\\a");
//        System.out.println(ReUtil.findAllGroup0(Pattern.compile("docs/.*html"), "<ul>\n" +
//                "<li><a onclick=\"setDocTitle(this.text)\" target=\"doc-iframe\"  href=\"docs/xa1.html\">a1</a>\n" +
//                "<ul>\n" +
//                "<li><a onclick=\"setDocTitle(this.text)\" target=\"doc-iframe\"  href=\"docs/b1.html\">b1</a></li>\n" +
//                "<li><a onclick=\"setDocTitle(this.text)\" target=\"doc-iframe\"  href=\"docs/b2.html\">b2</a>\n" +
//                "<ul>\n" +
//                "<li><a onclick=\"setDocTitle(this.text)\" target=\"doc-iframe\"  href=\"docs/d1.html\">d1</a></li>\n" +
//                "<li><a onclick=\"setDocTitle(this.text)\" target=\"doc-iframe\"  href=\"docs/d2.html\">d2</a></li>\n" +
//                "</ul>\n" +
//                "</li>\n" +
//                "</ul>\n" +
//                "</li>\n" +
//                "</ul>").get(0));
//        System.out.println(Paths.get("C:\\Users\\youthred\\Desktop\\a").getParent());
        FileUtil.loopFiles("C:\\Users\\youthred\\Desktop\\a-html-20220916224334").forEach(file -> System.out.println(file.getPath()));
    }
}