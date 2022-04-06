
'use strict';
var Logger = (function() {

	  var element;
	  var maxLines = 16;
	  
	  var Logger = function(name) {
	    if (!element) element = document.getElementById('log');
	    return function() {
	      var lines = [].slice.call(element.children).length;
	      var args = [].slice.call(arguments);
	      element.innerHTML += '<p>[' + name + '] ' + args.join(' ') + '</p>';
	      element.scrollTop = element.scrollHeight;
	      if (lines >= maxLines) element.removeChild(element.firstChild);
	      
	      console.log('[' + name + '] ', args);
	    };
	  };

	  return Logger;

	}());

var Parser = (function() {
  return {
    // kanalları m3u linklerine böl
    parse: function(data) {

    	
      var lastName;
      var channels = {};
     
      //data=data.replace("http","http");
     // data =data.split('\n');
      data =data.split('\r\n');
      for (var i in data) {
        var line = data[i];
        if (line.indexOf('#EXTINF:') != -1) {
          var set = line.split(':')[1].split(',');
          var name = set[1];        
          channels[name] = { no: set[0], name: name };
          lastName = name;
        } else if (line.indexOf('http') != -1 && lastName) {
          channels[lastName].url = line;
          lastName = null;
        }
      }
     //  document.getElementById('channel-list').innerHTML=data;
      return channels;
    }
  };
}());

var UI = (function() {

  // değişkenler
  var log, selectedChannel, messageTimeout;
  var dom = {};

  function scrollChannels() {

    var channelList = dom.channels;
    var sidebar = dom.sidebar;
    
    // Get element parameters
    var nodeList = [].slice.call(channelList.children);
    var itemIndex = nodeList.indexOf(selectedChannel);
    var itemHeight = selectedChannel.offsetHeight;
    var listHeight = sidebar.offsetHeight;
    var itemCount = int(listHeight / itemHeight);
    //seşili kanalı ekrana basar alert(itemIndex);
    // Calculate scroll position
    var scroll =
      int(itemIndex * itemHeight) - int(itemHeight * (itemCount / 2));
    // scroll = scroll >= 0 ? scroll : 0;
    sidebar.scrollTop = scroll;

  }

  // Round shortcut
  function int(number) {
    return Math.round(number);
  }

  //  UI API çağır
  return {
    init: function() {
      dom = {
    	kanalno: document.querySelector('.kanalno'),
        player: document.getElementById('av-player'),
        sidebar: document.querySelector('.sidebar'),
        channels: document.getElementById('channel-list'),
        message: document.getElementById('message'),
        log: document.getElementById('log')
      };
      log = new Logger('ui');
      log('ready');
    },
    playing: function(url) {    	 
      var item;
      item = dom.channels.querySelector('li.playing');
      if (item) item.classList.remove('playing');
      if (!url) return;
      item = dom.channels.querySelector('li[data-url="' + url + '"]');     
      if (item) item.classList.add('playing');      
      this.message(item.dataset.name + ' Açılıyor...', 60000);      
    },
    play: function() {
      this.message('Oynatılıyor');
    },
    stop: function() {
      this.message('Bağlantı Zayıf');
    },
    pause: function() {
      this.message('Bekle');
    },
    buffering: function(state, data) {
      var message = dom.message;
     
      if (state == 'progress') {
        this.message('Yükleniyor: ' + data + '%');
        message="";
      } else if (state == 'complete') {
        this.message();
      }
    },
    message: function(data, timeout) {
      var message = dom.message;
      if (messageTimeout) clearTimeout(messageTimeout);
      if (!data) return message.classList.add('hide');
      message.innerHTML = data;
      message.classList.remove('hide');
      messageTimeout = setTimeout(function() {
        message.classList.add('hide');
      }, timeout || 3000);
    },
    fullscreen: function(is) {
      dom.player.classList[is ? 'add' : 'remove']('fullscreen');
    },
    setAudio: function(no) {
      this.message('Ses: ' + no);
    },
    // Kanal listesini ayarla
    setChannels: function(chennelList) {
      var channels = dom.channels;
      var i=1;
      channels.innerHTML = '';
      for (var item in chennelList) {
        var li = document.createElement('li');
        item = chennelList[item];
        li.dataset.name = item.name;
        li.dataset.url = item.url;
        li.innerHTML =i + "."+ item.name;
        channels.appendChild(li);
        i++;
      }
      this.next();
    },
    OynatiyomuBak: function(name){		
		 var kanaladresi= document.getElementById('channel-list').querySelector('li[data-name="' + name + '"]'); 
		 var channelList = dom.channels;
		 var sidebar = dom.sidebar;
		 var url = kanaladresi.dataset.url;
		 var kanalagit = document.querySelector('.kanalno');
		 var GecmisSecimler=document.querySelector(".selected");	
			 GecmisSecimler.classList.remove('selected');			 
			// selectedChannel = kanaladresi.nextSibling;
		 if (name ==  kanaladresi.dataset.name) {
			      //  selectedChannel = channelList.firstChild;	
			    
					  var nodeList = [].slice.call(channelList.children);
					    var itemIndex = nodeList.indexOf(kanaladresi);
					
					    kanaladresi.focus();//tabIndex = -1;
					    var itemHeight = selectedChannel.offsetHeight;
					    var listHeight = sidebar.offsetHeight;
					    var itemCount = int(listHeight / itemHeight);
					    // İstenilen kanalın listeki konumuna gider
					    var scroll =
					      int(itemIndex * itemHeight) - int(itemHeight * (itemCount / 2));					  
					     sidebar.scrollTop = scroll;	  
					    kanaladresi.classList.add('selected');
			  kanalagit.textContent="";	
			//  webapis.avplay.open(kanaladresi.dataset.url);
		     // webapis.avplay.play();
			
		 }
		 
		 Player.play(url);



		  
	},
    next: function() {
    	//Kanal No bulma
    	// var kanalnumarasi = dom.kanalno.textContent;    	
    	 //dom.kanalno.textContent = parseInt(kanalnumarasi) + 1;
      var channelList = dom.channels;
      if (!selectedChannel) {
        selectedChannel = channelList.firstChild;
        
      } else {
        selectedChannel.classList.remove('selected');
        selectedChannel = selectedChannel.nextSibling;
      }
      if (!selectedChannel) selectedChannel = channelList.firstChild;
      selectedChannel.classList.add('selected');
      scrollChannels();
    },
    prev: function() {
    	//Kanal No bulma
    	// var kanalnumarasi = dom.kanalno.textContent;    	
    	 //dom.kanalno.textContent = parseInt(kanalnumarasi) - 1;
      var channelList = dom.channels;
      if (!selectedChannel) {
        selectedChannel = channelList.firstChild;
        selectedChannel.classList.add('selected');
      } else {
        selectedChannel.classList.remove('selected');
        selectedChannel = selectedChannel.previousSibling;
        if (!selectedChannel) selectedChannel = channelList.lastChild;
        selectedChannel.classList.add('selected');
      }
      scrollChannels();
    },
    get: function(name) {
      return dom[name];
    },
    get channel() {
      return selectedChannel.dataset;
    },
  };
  
}());


var Player = (function() {
  
  // Globals
  var log, tv, screen, player;
  var playerUrl;

  var is4k = false;
  var isFullscreen = false;

  var audioTrack = 1;
  // Retrun Player API
  return {
    init: function(data) {
      tv = data;
      player = UI.get('player');
      log = new Logger('player');
      this.updatePlayerScreen();
      log('ready');
    },
    updatePlayerScreen: function() {
      var playerBounds = player.getBoundingClientRect();
      // Ekran ayarları
      screen = [
        playerBounds.left, playerBounds.top,
        playerBounds.width, playerBounds.height
      ];
      log('update player screen:', screen.join(', '));
      return screen;
    },
    next: function() {
      UI.next();
      //if (isFullscreen) this.toggleFullscreen();
    },
    prev: function() {
      UI.prev();
      //if (isFullscreen) this.toggleFullscreen();
    },
    enter: function() {
      var channel = UI.channel;
      if (channel.url == playerUrl && this.state == 'PLAYING') {
        this.toggleFullscreen();
      } else {
    	  webapis.avplay.stop();
    	  this.play(channel.url);
       
      }
      
    },
    
   
    play: function(url) {
      if (!url) {
        log('play');
        UI.play();
        return webapis.avplay.play();
      }
      log('Oynatılıyor:', url);
      playerUrl = url;
      audioTrack = 1;
      UI.playing(url);
      webapis.avplay.open(url);
      webapis.avplay.setListener({
        onbufferingstart: function() {
          log('buffering start');
        },
        onbufferingprogress: function(percent) {
          log('buffering progress:', percent);
          UI.buffering('progress', percent);
        },
        onbufferingcomplete: function() {
          log('buffering complete');
          UI.buffering('complete');
        },
        // oncurrentplaytime: function(time) {
        //   log('current playtime:', time);
        // },
        onevent: function (type, data) {
          log('event type:', type, 'data:', data);
         // alert(data);
        },
        onstreamcompleted: function() {
          log('stream compited');
          this.stop();
        }.bind(this),
        onerror: function (error) {
          log('event error:', error);
          alert(error);
        }
      });
      webapis.avplay.setDisplayRect.apply(null, screen);
      webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN');
      if (is4k) this.set4k(true);
      // webapis.avplay.prepare();
      webapis.avplay.prepareAsync(function() {
        webapis.avplay.play();
      });
    },
    playPause: function() {
      log('play/pause');
      return this.state == 'PLAYING' ? this.pause() : this.play();
    },
    pause: function() {
      log('pause');
      UI.pause();
      webapis.avplay.pause();
    },
    stop: function() {
      log('stop');
      UI.stop();
      webapis.avplay.stop();
    },
    foward: function(num) {
      num = num || 3000;
      log('foward:', num);
      webapis.avplay.jumpForward(num);
    },
    rewind: function(num) {
      num = num || 3000;
      log('rewind:', num);
      webapis.avplay.jumpBackward(num);
    },
    set4k: function(value) {
      log('set 4k:', value);
      webapis.avplay.setStreamingProperty('SET_MODE_4K', value);
    },
    setTrack: function(type, index) {
      log('set track:', type, index);
      webapis.avplay.setSelectTrack(type, index);
      UI.setAudio(index);
    },
    nextAudio: function() {
      var list = [];
      var trackList = this.getTracks();
      for (var i in trackList) {
        log('tracks:', trackList[i].type);
        if (trackList[i].type == 'AUDIO') list.push(trackList[i]);
      }
      var length = list.length;
      audioTrack++;
      if (audioTrack > length) audioTrack = 1;
      log('set audio:', audioTrack);
      this.setTrack('AUDIO', audioTrack);
    },
    getTracks: function() {
      log('get tracks');
      return webapis.avplay.getTotalTrackInfo();
    },
    
    Fullscreen: function() {
      if (isFullscreen) {        
        log('force fullscreen on:', [tv.width, tv.height].join('x'));
        UI.fullscreen(isFullscreen = true);
        webapis.avplay.setDisplayRect(0, 0, tv.width, tv.height);
      }
    },
    ekranBoyutu: function() {
    
    		 return isFullscreen;
    	
    	
    },
    
    toggleFullscreen: function() {
      if (isFullscreen) {
        log('fullscreen off:', [screen[2], screen[3]].join('x'));
        UI.fullscreen(isFullscreen = false);
        webapis.avplay.setDisplayRect.apply(null, screen);
      } else {
        log('fullscreen on:', [tv.width, tv.height].join('x'));
        UI.fullscreen(isFullscreen = true);
        webapis.avplay.setDisplayRect(0, 0, tv.width, tv.height);
      }
    },
    get url() {
      return playerUrl;
    },
    get state() {
      return webapis.avplay.getState();
    }
  };

}());





  // Globals
  var log, tv;

  // Remote control keys
  var usedKeys = [
    'Info',
    'MediaPause', 'MediaPlay',
    'ChannelUp','ChannelDown',
    'MediaPlayPause', 'MediaStop',
    'MediaFastForward', 'MediaRewind',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ];

  // Register keys
  usedKeys.forEach(function(key) {
    tizen.tvinputdevice.registerKey(key);
  });

  // Key events
  document.addEventListener('keydown', function(e) {
    var key = e.keyCode;
    var tus="";
    var kanalagit = document.querySelector('.kanalno');
    var channelList=document.getElementById('channel-list');
	  var kanalnumarasi = kanalagit.textContent;  
	  var kanallar;
    switch (key) {
      case 10252: // MediaPlayPause
      case 415: // MediaPlay
        log('key: play/pause');
        Player.playPause();
        break;
      case 19: // MediaPause
        log('key: pause');
        Player.pause();
        break;
      case 413: // MediaStop
          log('key: stop');
          Player.stop();
          break;
      case 427: // kanal yukarı
    	
    	 if(Player.ekranBoyutu())
    		  {
    		 Player.prev();    			 	 
	    	  Player.enter();
	    	  Player.Fullscreen(); 
    		     }else{
    		    	  Player.next();
    	        	  Player.enter();
    	        	  Player.Fullscreen();
    		  }
    	 
          break;
        
      case 428: // Kanal Aşağı
    	  if(Player.ekranBoyutu())
		  {
    		  Player.next();
        	  Player.enter();
        	  Player.Fullscreen();
    	  
		  }else{
			  Player.prev();    			 	 
	    	  Player.enter();
	    	  Player.Fullscreen();
		  }
    	  
    	
        break;
      case 417: // MediaFastForward
        Player.foward();
        break;
      case 412: // MediaRewind
        Player.rewind();
        break;
      case 38: // Up
        log('key: up');
        Player.prev();
        break;
      case 40: // Down
        log('key: down');
        Player.next();
        break;
      case 13: // Enter
        log('key: enter');
        Player.enter();
        break;
      case 457: // Info
        log('video state:', Player.state);
        UI.get('log').classList.toggle('hide');
        Player.nextAudio();
        break;
      case 48: // Key 0     
    	  tus="0";  	
      	  
          kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	      kanallar=channelList.getElementsByTagName("li");            
   	       setTimeout(function() {
	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);     		
   }, 3000);
          break;
      case 49: // Key 1  Player.set4k(true);
    	  tus="1";
          kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	   kanallar=channelList.getElementsByTagName("li");        
   	 setTimeout(function() {
	    	//Player.play(kanallar[kanalnumarasi-1].dataset.url);   	      
	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);          		
 }, 3000);          
          break;
      case 50: // Key 2  Player.set4k(false);
    	  tus="2";   	
    	  kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	      kanallar=channelList.getElementsByTagName("li");            
   	   setTimeout(function() {
	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);     		
   }, 3000);
          break;
      case 51: // Key 3
    	  tus="3";
    	  kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);         
    	   kanalnumarasi = kanalagit.textContent;  
    	   kanallar=channelList.getElementsByTagName("li");      
    	   setTimeout(function() {
   	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);        		
       }, 3000);
          break;
      case 52: // Key 4
    	  tus="4";
    	  kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	   kanallar=channelList.getElementsByTagName("li");           
   	 setTimeout(function() {
	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);        		
 }, 3000);
          break;
      case 53: // Key 5
    	  tus="5";
    	  kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	   kanallar=channelList.getElementsByTagName("li");         
   	 setTimeout(function() {
	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);   		
 }, 3000);
          break;
      case 54: // Key 6
    	  tus="6";
    	  kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	   kanallar=channelList.getElementsByTagName("li");       
   	  setTimeout(function() { 
	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);       		
    }, 3000);
          break;
      case 55: // Key 7
    	  tus="7";
    	  kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	   kanallar=channelList.getElementsByTagName("li");      
   	  setTimeout(function() { 
	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);      		
    }, 3000);
          break;
      case 56: // Key 8
    	  tus="8";     	
    	  kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	   kanallar=channelList.getElementsByTagName("li");         
         setTimeout(function() {
    	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);     		
          },3000);
          break;
      case 57: // Key 9
    	  tus="9";      
    	  kanalagit.textContent =  kanalagit.textContent + tus;
          log('key:', key);
          kanalnumarasi = kanalagit.textContent;  
   	   kanallar=channelList.getElementsByTagName("li");      
   	  setTimeout(function() {
	    	//Player.play(kanallar[kanalnumarasi-1].dataset.url);   	      
	    	UI.OynatiyomuBak(kanallar[kanalnumarasi-1].dataset.name);  
    }, 3000);
        break;
    }
  });

  // On DOM loaded
 
  
  
  
  
  function onLoad(mac) {

    // Load info dom elements
	
	    
      // Listeyi Bulalım
      var xhrd = new XMLHttpRequest();
      xhrd.open('GET', 'http://musteri.tilmaxtech.com/xiptv/?mac=' + mac, true);
      xhrd.send(null);
      
      xhrd.onreadystatechange = function() {
        if (xhrd.readyState == 4) {
          if (xhrd.status === 0 || xhrd.status == 200) {
        
       
         UI.init();
         // Kanal listesini Çektirelim
         tizen.systeminfo.getPropertyValue('DISPLAY', function(data) {
           tv = {
             width: data.resolutionWidth,
             height: data.resolutionHeight
           };
           // Listeyi AKIT yEĞEN
           
           var xhr = new XMLHttpRequest();
           xhr.open('GET', xhrd.responseText, true);
           xhr.send(null);
           
           xhr.onreadystatechange = function() {
             if (xhr.readyState == 4) {
               if (xhr.status === 0 || xhr.status == 200) {
                 var channels = Parser.parse(xhr.responseText);
                 UI.setChannels(channels);
                 Player.init(tv);
                 var channel = UI.channel;               
                 Player.play(channel.url);
               
               } else {
                 alert('Kanallar Yüklenemiyor:', xhr.status);
               }
             }
           };
         });
          } else {
            alert('Kanallar Yüklenemiyor:', xhrd.status);
          }
        }
      };
	  

    var build = document.querySelector('.build');

    // İŞLEM KAYITLARINI SAKLAYALIM
    log = new Logger('app');
    log('DOM loaded');

    // Cihaz Model Kodu
    tizen.systeminfo.getPropertyValue('BUILD', function(data) {    
      build.innerHTML =  data.model;
    }); 
    //  UI çalıştıralım 
   


  }

 

function hata(error) {
    alert("Hata: " + error.message);
}

function macCek(){
	
tizen.systeminfo.getPropertyValue('NETWORK', function(data) {

if (data.networkType == "WIFI" ){
	
	tizen.systeminfo.getPropertyValue('WIFI_NETWORK', function(wifi) {
		document.getElementById('mac').textContent = wifi.macAddress;
		onLoad(wifi.macAddress);
	},hata);
	
}else if ( data.networkType == "ETHERNET"  &&   data.networkType == "wired" ){
	tizen.systeminfo.getPropertyValue('ETHERNET_NETWORK', function(kablo) {	
	document.getElementById('mac').textContent = kablo.macAddress;
	onLoad(kablo.macAddress);
	},hata);

}else{	

	document.getElementById('mac').textContent ="İnternete Bağlı değilsiniz.";
	onLoad("İnternete Bağlı değilsiniz.");
}	 
	});

}
// aÇILIŞTA onLoad fONKSİYON çALIŞTIRMA
document.addEventListener('DOMContentLoaded', macCek);



//Update cpu
//setInterval(function() {	
//	mac.innerHTML="asasas";
	//  tizen.systeminfo.getPropertyValue('NETWORK', function(data) {
	  //      cpu.innerHTML = data.networkType;	      });	
//}, 1000);