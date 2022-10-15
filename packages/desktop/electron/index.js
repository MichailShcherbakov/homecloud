'use strict';

Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });

const electron = require('electron');
const common = require('@nestjs/common');
const ini = require('ini');
const path = require('path');
const fs$1 = require('fs');
const fs = require('fs/promises');
const uuid = require('uuid');
const core = require('@nestjs/core');

const _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { default: e };

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
  if (e) {
    for (const k in e) {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}

const ini__default = /*#__PURE__*/_interopDefaultLegacy(ini);
const path__namespace = /*#__PURE__*/_interopNamespace(path);
const fs__namespace = /*#__PURE__*/_interopNamespace(fs);
const uuid__namespace = /*#__PURE__*/_interopNamespace(uuid);

var __decorate$9 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$5 = globalThis && globalThis.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let AppContoller = class AppContoller {
    getStatus() {
        return {
            status: "ok"
        };
    }
};
__decorate$9([
    common.Get("/status"),
    __metadata$5("design:type", Function),
    __metadata$5("design:paramtypes", [])
], AppContoller.prototype, "getStatus", null);
AppContoller = __decorate$9([
    common.Controller("/")
], AppContoller);

var __decorate$8 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$4 = globalThis && globalThis.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let ConfigService = class ConfigService {
    get(section, key) {
        return this.config[section][key];
    }
    async set(section, key, val) {
        this.config[section][key] = val;
        await this.sync();
    }
    sync() {
        return fs.writeFile(this.path, ini__default.default.stringify(this.config));
    }
    constructor(){
        this.path = path.resolve(process.cwd(), "config.ini");
        this.config = ini__default.default.parse(fs$1.readFileSync(this.path, "utf-8"));
    }
};
ConfigService = __decorate$8([
    common.Injectable({}),
    __metadata$4("design:type", Function),
    __metadata$4("design:paramtypes", [])
], ConfigService);

var __decorate$7 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ConfigModule = class ConfigModule {
};
ConfigModule = __decorate$7([
    common.Module({
        providers: [
            ConfigService
        ],
        exports: [
            ConfigService
        ]
    })
], ConfigModule);

async function deepReadDir(globalRootPath, localRootPath = "", parentDirUuid = null) {
    const rootDir = await fs__namespace.readdir(globalRootPath, {
        withFileTypes: true
    });
    const entities = [];
    await Promise.all(rootDir.map(async (entity)=>{
        const localPath = `${localRootPath}/${entity.name}`;
        const globalPath = path.join(globalRootPath, entity.name);
        const stat = await fs__namespace.lstat(globalPath);
        const baseEntity = {
            uuid: uuid__namespace.v4(),
            name: entity.name,
            path: localPath,
            size: stat.size,
            parentDirUuid
        };
        if (entity.isDirectory()) {
            const directory = {
                ...baseEntity,
                isFile: false,
                isDirectory: true
            };
            const entries = await deepReadDir(globalPath, localPath, directory.uuid);
            directory.size = entries.reduce((folderSize, entry)=>folderSize + entry.size, 0);
            entities.push(directory);
            entities.push(...entries);
        }
        if (entity.isFile()) {
            const file = {
                ...baseEntity,
                ext: path.extname(globalPath),
                isFile: true,
                isDirectory: false
            };
            entities.push(file);
        }
    }));
    return entities;
}

var __decorate$6 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$3 = globalThis && globalThis.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let LocalStorage = class LocalStorage {
    async onModuleInit() {
        const rootPath = this.configService.get("path", "root");
        this.entities = await deepReadDir(rootPath);
    }
    onModuleDestroy() {
        this.entities = [];
    }
    getEntities() {
        return this.entities;
    }
    getFiles() {
        return this.entities.filter((e)=>e.isFile);
    }
    getDirectories() {
        return this.entities.filter((e)=>e.isDirectory);
    }
    getRootEntities() {
        return this.entities.filter((e)=>!e.parentDirUuid);
    }
    getEntity(uuid) {
        var ref;
        return (ref = this.entities.find((e)=>e.uuid === uuid)) !== null && ref !== void 0 ? ref : null;
    }
    getDirectory(uuid) {
        const entity = this.getEntity(uuid);
        return (entity === null || entity === void 0 ? void 0 : entity.isDirectory) ? entity : null;
    }
    getFile(uuid) {
        const entity = this.getEntity(uuid);
        return (entity === null || entity === void 0 ? void 0 : entity.isFile) ? entity : null;
    }
    getDirectoryEntities(uuid) {
        const directory = this.getDirectory(uuid);
        if (!directory) throw new common.NotFoundException("The directory not found");
        return this.entities.filter((e)=>e.parentDirUuid === directory.uuid);
    }
    constructor(configService){
        this.configService = configService;
        this.entities = [];
    }
};
LocalStorage = __decorate$6([
    common.Injectable(),
    __metadata$3("design:type", Function),
    __metadata$3("design:paramtypes", [
        typeof ConfigService === "undefined" ? Object : ConfigService
    ])
], LocalStorage);

var __decorate$5 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$2 = globalThis && globalThis.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let FileSystemService = class FileSystemService {
    async onModuleInit() {}
    onModuleDestroy() {}
    constructor(configService, localStorage){
        this.configService = configService;
        this.localStorage = localStorage;
    }
};
FileSystemService = __decorate$5([
    common.Injectable(),
    __metadata$2("design:type", Function),
    __metadata$2("design:paramtypes", [
        typeof ConfigService === "undefined" ? Object : ConfigService,
        typeof LocalStorage === "undefined" ? Object : LocalStorage
    ])
], FileSystemService);

var __decorate$4 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let FileSystemModule = class FileSystemModule {
};
FileSystemModule = __decorate$4([
    common.Module({
        imports: [
            ConfigModule
        ],
        providers: [
            FileSystemService,
            LocalStorage
        ],
        exports: [
            FileSystemService,
            LocalStorage
        ]
    })
], FileSystemModule);

var __decorate$3 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = globalThis && globalThis.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let StorageService = class StorageService {
    async getStatistics() {
        const files = this.localStorage.getFiles();
        const dirs = this.localStorage.getDirectories();
        const totalFileCount = files.length;
        const totalDirCount = dirs.length;
        const totalSpaceSize = files.reduce((size, file)=>size + file.size, 0);
        return {
            total_dirs_count: totalDirCount,
            total_file_count: totalFileCount,
            total_space_size: totalSpaceSize
        };
    }
    async getRootEntities() {
        return this.localStorage.getRootEntities();
    }
    async getDirEntities(uuid) {
        return this.localStorage.getDirectoryEntities(uuid);
    }
    async getGlobaFilePath(uuid) {
        const file = this.localStorage.getFile(uuid);
        if (!file) throw new common.NotFoundException("The file not found");
        const rootPath = this.configService.get("path", "root");
        return path.join(rootPath, file.path);
    }
    constructor(configService, localStorage){
        this.configService = configService;
        this.localStorage = localStorage;
    }
};
StorageService = __decorate$3([
    common.Injectable(),
    __metadata$1("design:type", Function),
    __metadata$1("design:paramtypes", [
        typeof ConfigService === "undefined" ? Object : ConfigService,
        typeof LocalStorage === "undefined" ? Object : LocalStorage
    ])
], StorageService);

var __decorate$2 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = globalThis && globalThis.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = globalThis && globalThis.__param || function(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
};
let StorageController = class StorageController {
    getStatistics() {
        return this.storageService.getStatistics();
    }
    getRootEntities() {
        return this.storageService.getRootEntities();
    }
    getDirEntities(uuid) {
        return this.storageService.getDirEntities(uuid);
    }
    async getFile(uuid, req, res) {
        const path = await this.storageService.getGlobaFilePath(uuid);
        const stat = fs$1.statSync(path);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = fs$1.createReadStream(path, {
                start,
                end
            });
            const head = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "video/mp4"
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head1 = {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4"
            };
            res.writeHead(200, head1);
            fs$1.createReadStream(path).pipe(res);
        }
    }
    constructor(storageService){
        this.storageService = storageService;
    }
};
__decorate$2([
    common.Get("/statistics"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [])
], StorageController.prototype, "getStatistics", null);
__decorate$2([
    common.Get("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [])
], StorageController.prototype, "getRootEntities", null);
__decorate$2([
    common.Get("/dirs/:uuid"),
    __param(0, common.Param("uuid", common.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        String
    ])
], StorageController.prototype, "getDirEntities", null);
__decorate$2([
    common.Get("/files/:uuid"),
    __param(0, common.Param("uuid", common.ParseUUIDPipe)),
    __param(1, common.Req()),
    __param(2, common.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        String,
        typeof Request === "undefined" ? Object : Request,
        typeof Response === "undefined" ? Object : Response
    ])
], StorageController.prototype, "getFile", null);
StorageController = __decorate$2([
    common.Controller("/storage"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
        typeof StorageService === "undefined" ? Object : StorageService
    ])
], StorageController);

var __decorate$1 = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let StorageModule = class StorageModule {
};
StorageModule = __decorate$1([
    common.Module({
        imports: [
            ConfigModule,
            FileSystemModule
        ],
        controllers: [
            StorageController
        ],
        providers: [
            StorageService
        ],
        exports: [
            StorageService
        ]
    })
], StorageModule);

var __decorate = globalThis && globalThis.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let AppModule = class AppModule {
};
AppModule = __decorate([
    common.Module({
        imports: [
            StorageModule
        ],
        controllers: [
            AppContoller
        ]
    })
], AppModule);

async function createApp(appModule) {
    const app = await core.NestFactory.create(appModule);
    app.enableCors({
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
        origin: "*"
    });
    app.enableShutdownHooks();
    return app;
}

let app;
async function bootstrap() {
    app = await createApp(AppModule);
    await app.listen(12536);
}
async function shutdown() {
    await app.close();
}

function createTray(app) {
    const tray = new electron.Tray(path__namespace.resolve(__dirname, "../../public/icon.ico"));
    const contextMenu = electron.Menu.buildFromTemplate([
        {
            label: "Sync",
            type: "checkbox",
            checked: true,
            enabled: false
        },
        {
            label: "Listening on port 12536",
            enabled: false
        },
        {
            type: "separator"
        },
        {
            label: "Home Cloud v0.0.1",
            enabled: false
        },
        {
            type: "separator"
        },
        {
            label: "Quit",
            click () {
                app.quit();
            }
        }
    ]);
    tray.setToolTip("Home Cloud");
    tray.setContextMenu(contextMenu);
    return tray;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    electron.app.quit();
}
electron.app.on("ready", async ()=>{
    console.log("App is starting...");
    createTray(electron.app);
    await bootstrap();
    console.log("App is started.");
});
electron.app.on("quit", async ()=>{
    console.log("App is closing...");
    await shutdown();
    console.log("App is closed.");
});
const viteNodeApp = electron.app;

exports.viteNodeApp = viteNodeApp;
