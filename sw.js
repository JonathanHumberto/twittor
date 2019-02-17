importScripts('js/sw-utils.js');

const STATIC_CACHE  = 'static-v4';
const DYNAMIC_CACHE = 'dynamic-v2';
const INMUTABLECACHE = 'inmutable-v1';

const CACHE_DYNAMIC_LIMIT = 50;
const APP_SHELL=
[
    //'/',
    '/index.html',
    '/css/style.css',
    '/img/favicon.ico',
    'img/avatars/spiderman.jpg',            
    'img/avatars/ironman.jpg',            
    'img/avatars/wolverine.jpg',            
    'img/avatars/thor.jpg',            
    'img/avatars/hulk.jpg',
    'js/app.js'
];

const APP_SHELL_INMUTABLE =
[
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
	'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];
function limpiarCache( cacheName, numeroItems ) {


    caches.open( cacheName )
        .then( cache => {

            return cache.keys()
                .then( keys => {
                    
                    if ( keys.length > numeroItems ) {
                        cache.delete( keys[0] )
                            .then( limpiarCache(cacheName, numeroItems) );
                    }
                });

            
        });
}




self.addEventListener('install', e => {


    const cacheStatic = caches.open(STATIC_CACHE).then( cache =>
        cache.addAll(APP_SHELL));

    const cacheInmutable = caches.open(INMUTABLECACHE).then( cache =>
        cache.addAll(APP_SHELL_INMUTABLE));

    e.waitUntil( Promise.all([cacheStatic, cacheInmutable]) );

});

self.addEventListener('activate', e => {


    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            // static-v4
            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }

            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }
        });
       
    });
    e.waitUntil( respuesta);
});


self.addEventListener('fetch', e => {

    const respuesta=caches.match(e.request).then( res=>{

        if(res)
        {
         return res;   
        }
        else 
        {
            
            return fetch(e.request).then(new_Res =>{
                return actualizaCacheDinamico(DYNAMIC_CACHE,e.request,new_Res);
            });
            
        }

    });
    e.respondWith(respuesta);
});