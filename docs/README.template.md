# ![DropZoneBot](./utils/images/dropzonebot.webp) DropZoneBot

> - DropZoneBot for Discord

---

![Bun](https://img.shields.io/badge/Bun-$_bun-informational?style=plastic&logo=bun) &nbsp;
![discord.js](https://img.shields.io/badge/discord.js-$_discord-informational?style=plastic&logo=discord.js) &nbsp;
![Drizzle](https://img.shields.io/badge/Drizzle-$_drizzle-informational?style=plastic&logo=drizzle)
![SQLite](https://img.shields.io/badge/SQLite-$_sqlite-informational?style=plastic&logo=sqlite)

![CodeQL](https://github.com/$_user/$_repo/workflows/CodeQL/badge.svg) &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-$_coverage%25-success?style=plastic&logo=jest)

![NO AI](https://img.shields.io/badge/NO-AI-orange?style=plastic "NO AI") &nbsp;
![License](https://img.shields.io/github/license/$_user/$_repo?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3") &nbsp; <!-- markdownlint-disable MD013 -->
![CVE Scan](https://img.shields.io/badge/CVE%20Scan-Pass-success?style=plastic&logo=owasp "CVE Scan")

---

### What it does: <!-- markdownlint-disable-line MD001 -->

- Drops loot

---

### 🔗 Invite Link <!-- markdownlint-disable-line MD001 -->

[Add DropZoneBot](https://discord.com/oauth2/authorize?client_id=1491121781006925854&permissions=93248&integration_type=0&scope=bot)

---

### 🖥️ Discord

#### Role Permissions:

|   ⚙️ Permission    |
|:------------------:|
|    ViewChannel     |
|    SendMessages    |
|     EmbedLinks     |
|    AddReactions    |
|   ManageMessages   |
| ReadMessageHistory |

#### Commands:

|     📋 Task      |      🔧 Command       | ⚙️ Permission |
|:----------------:|:---------------------:|:-------------:|
|    Drop Loot     |        `/drop`        | Administrator |
|       Info       |        `/info`        |     None      |
| Show Leaderboard |    `/leaderboard`     |     None      |
|  List All Loot   |        `/loot`        |     None      |
|       Ping       |        `/ping`        |     None      |
|   Reset Scores   | `/reset <@user\|all>` | Administrator |
|      Status      |       `/status`       | Administrator |

---

### 🖧 Docker

#### Environment Variables:

|             📝 Description             | 📌 Variable |  {...} Value   |
|:--------------------------------------:|:-----------:|:--------------:|
|                Activity                |  ACTIVITY   |    Dropping    |
|               Channel ID               | CHANNEL_ID  |     \<id>      |
|        Embed Color<sup>1</sup>         |    COLOR    |    #78866b     |
|                DB Name                 |   DB_NAME   | dropzonebot.db |
|                DB Path                 |   DB_PATH   |     ./db/      |
|               Loot Emoji               |    EMOJI    |       💰       |
|                 Debug                  |    DEBUG    | true/**false** |
|    Maximum Drop Time<sup>2,3</sup>     |  MAX_TIME   |       3h       |
|     Minimum Drop Time<sup>2</sup>      |  MIN_TIME   |       1h       |
|                Bot Name                |    NAME     |  DropZoneBot   |
| Claim Timeout (in minutes)<sup>4</sup> |   TIMEOUT   |       1        |
|               Bot Token                |    TOKEN    |    \<token>    |

###### <sup>1</sup> #RRGGBB format <!-- markdownlint-disable-line MD001 -->

###### <sup>2</sup> 1-59m | 1-6h format

###### <sup>3</sup> Must be >= `MIN_TIME`

###### <sup>4</sup> Must be >= 1

##### From `@postfmly/logoserver`:

| 📝 Description | 📌 Variable |    {...} Value    |
|:--------------:|:-----------:|:-----------------:|
|   Logo Name    |  LOGO_NAME  | dropzonebot.webp  |
|   Local Path   |  LOGO_PATH  |  ./utils/images   |
|      Port      |  LOGO_PORT  | **Random**/[port] |
|    Logo URL    |  LOGO_URL   |      \<url>       |

##### From `@postfmly/checkrate`:

###### *NOTE: Rate limited to 1 request per 1 second*

#### Deployment:

|  📜 Script  |  🔧 Command   |
|:-----------:|:-------------:|
|    Full     | `./build.sh`  |
| Docker Only | `./docker.sh` |

---

### 📃 Loot

`loot.csv`

##### - `name` is Item Name <!-- markdownlint-disable-line MD001 -->

##### - `min` is Minimum Loot Value

##### - `max` is Maximum Loot Value

```csv
name,min,max
Loot Item,100,200
```

###### *NOTES:*

###### - *`name` length must be >= 2*

###### - *`min` must be > 0*

###### - *`max` must be >= `min`*

---

### 📄 Documentation

### Generate:

```bash
./docs.sh
```

---

### 🛰️ Git & CI/CD

- **Pre-Commit:** Staged files are automatically linted
- **Github Actions:** Builds and pushes images to repository
  - latest
    - amd64
    - arm64
