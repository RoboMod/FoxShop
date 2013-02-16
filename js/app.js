  //'use strict';
        // DB init
  const DB_NAME = 'ShoppingList';
  const DB_VERSION = 2; // Use a long long for this value (don't use a float)
  const DB_STORE_LISTS = 'lists2';
  const DB_STORE_ITEMS = 'items1';

SL = {
  hide: function(target) {
    target = SL.id(target).style;
    target.zIndex = "1";
    target.opacity = "0";
  },
  show: function(target) {
    target = SL.id(target).style;
    target.zIndex = "6";
    target.opacity = "1";
  },
  removeElement: function(node) {
    node.parentNode.removeChild(node);
  },
  id: function(target) {
    return document.getElementById(target);
  },

  //Unused for now
  class: function(target, n) {
    if (typeof n === "undefined")
      n = 0;

    return document.getElementByClassName(target)[n];
  }
};

SL.Settings = {
  elm: SL.id("settingsPanel"),
  close: function() {
    SL.hide("settingsPanel");
  }
};

/*******************************************************************************
 * Lists
 ******************************************************************************/
SL.Lists = {
  elm : SL.id("lists"),
  arrayList : {},
  store: DB_STORE_LISTS,
  init: function() {
    SL.view = "Lists";
    SL.show("lists");

    /*var request = navigator.mozApps.getSelf();
    request.onsuccess = function() {
      if (!request.result) {
        SL.action("install", "show");
        SL.action(null, "install", this, "click");
      }
    };*/
  },
  close: function() {
    SL.view = "";
    SL.hide("lists");
  },
  add: function(aList) {
    DB.store(aList, SL.Lists);
    SL.Lists.display(aList, SL.Lists);
  },
  new: function() {
    var name = SL.id('listName').value;
    var date = new Date();

    if (!name || name === undefined) {
      displayActionFailure("msg-name");
      return;
    }
    SL.Lists.add({ guid: guid(),
                   name: name,
                   date: date.getTime(),
                   items:{}
    });
    SL.id('listName').value ="";
  },
  edit: function (aItem, elm) {
    aList.done = elm.getElementsByTagName("input")[0].checked;
    aList.name = elm.getElementsByTagName("a")[0].innerHTML;

    // Delete the list, add the updated one
    DB.deleteFromDB(aList.guid, SL.Lists);
    DB.store(aList, SL.Lists);
  },
  display: function(aList) {

    var newLi = document.createElement('li');
    newLi.dataset.listkey = aList.guid;

    // Part 1 toggle
    var newToggle = document.createElement('label');
    //newToggle.className +="danger";
    //newToggle.setAttribute('for', aList.guid);
    var mySpan = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    //checkbox.setAttribute('id', aList.guid);
    if (aList.done) {
      newLi.className += " done";
      checkbox.setAttribute('checked', true);
    } 

    newToggle.appendChild(checkbox);
    newToggle.appendChild(mySpan);

    mySpan.addEventListener("click", function(e) {

      if (!aList.done) {
        newLi.className += " done";
      } else {
        newLi.className = newLi.className.replace ( /(?:^|\s)done(?!\S)/g , '' );
      }
      aList.done = !aList.done;

      // Delete the item, add the updated one
      DB.deleteFromDB(aList.guid, SL.Lists);
      DB.store(aList, SL.Lists);
    });


    // Part 2 pack-end
    var packEnd  = document.createElement('aside');
    packEnd.className = "pack-end";

    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');
    var nb = 0;
    p1.innerHTML = aList.name;
    DB.getItems(aList.guid);
    p2.innerHTML = nb + " items";
    newTitle.className = "liTitle";
    newTitle.addEventListener("click", function(e) {
      SL.Items.init(aList);
    });
    newTitle.appendChild(p1);
    newTitle.appendChild(p2);


/*
    var newDelete = document.createElement('a');
    newDelete.className = 'delete';
    newDelete.addEventListener("click", function(e) {
      newLi.style.display = "none";
      DB.deleteFromDB(aList.guid, SL.Lists);
    });
    */
    
    newLi.appendChild(newToggle);
    newLi.appendChild(packEnd);
    newLi.appendChild(newTitle);
    //newLi.appendChild(newDelete);

    SL.Lists.elm.getElementsByClassName("list")[0].appendChild(newLi);
    this.arrayList[aList.guid] = aList;
  },
  clear: function() {
    var lists = SL.id("lists");
    var list = document.getElementsByClassName("list")[0];
    lists.removeChild(list);
    var ul = document.createElement('ul');
    ul.className =  'list';
    lists.appendChild(ul);
  },
  completeall: function() {
    
    var nodes = SL.Lists.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=1; i<nodes.length; i++) {
        nodes[i].getElementsByTagName('input')[0].setAttribute("checked", true);
        nodes[i].className.replace ( /(?:^|\s)done(?!\S)/g , '' );
        nodes[i].className += " done";
    }
  }
};

/*******************************************************************************
 * editLists
 ******************************************************************************/
SL.editLists = {
  elm: SL.id("editLists"),
  store: DB_STORE_LISTS,
  init: function() {
    SL.Lists.close();
    SL.view = "editLists";

    SL.show("editLists");

    var node = this.elm.getElementsByClassName("list")[0];
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }

    DB.displayList(null, SL.editLists);
  },
  display: function(aList) {
    var newLi = document.createElement('li');
    newLi.dataset.listkey = aList.guid;

    // Part 1 toggle
    var newToggle = document.createElement('label');
    newToggle.className +="danger";
    //newToggle.setAttribute('for', aList.guid);
    var mySpan = document.createElement('span');
    mySpan.addEventListener("click", function(e) {
      newLi.dataset.select = "true";
    });
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    //checkbox.setAttribute('id', aList.guid);

    newToggle.appendChild(checkbox);
    newToggle.appendChild(mySpan);

    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');

    p1.innerHTML = aList.name;
    newTitle.className = "liTitle";
    newTitle.appendChild(p1);

    newLi.appendChild(newToggle);
    newLi.appendChild(newTitle);

    this.elm.getElementsByClassName("list")[0].appendChild(newLi);
  },
  deleteSelected: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      if(nodes[i].getElementsByTagName("input")[0].checked) {
        DB.deleteFromDB(nodes[i].dataset.listkey, SL.editLists);
        nodes[i].style.display = "none";
      }
    }
  },
  selectAll: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      nodes[i].getElementsByTagName("input")[0].setAttribute("checked", "true");
    }
  },
  deselectAll: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      nodes[i].getElementsByTagName("input")[0].removeAttribute("checked");
    }
  }
}

/*******************************************************************************
 * Items
 ******************************************************************************/
SL.Items = {
  elm: SL.id("items"),
  store: DB_STORE_ITEMS,
  init: function(aList) {
    SL.Lists.close();
    SL.view = "Items";

    this.list = aList;
    // Set title of the displayed Items list
    this.elm.getElementsByClassName("title")[0].innerHTML=aList.name;

    SL.Items.clear();
    DB.displayItems(aList);
    SL.hide("lists");
    SL.show("items");
  },

  // Go back to Lists view
  back: function() {
    // Hide Items list
    SL.hide("items");
    // Display Lists list
    SL.Lists.init();
  },

  // Add an item to the current list
  new: function() {
    var name = SL.id('itemName').value;
    var qty = SL.id('itemQty').value;
    var date = new Date();

    // Handle empty form
    if (!name || !qty) {
      var l10n = "";
      if (!name) {
        //l10n += "You must enter a name";
        l10n += "msg-name";
        if (!qty)
          l10n += "msg-name-qty"
      }
      if (!qty)
        l10n += "msg-qty"

      displayActionFailure(l10n);
      return;
    }

    aItem = { guid: guid(),
              name: name,
              list: SL.Items.list.guid,
              nb: qty,
              date: date.getTime(),
              done: false
    };
    name = "";
    qty = "1";

    DB.store(aItem, SL.Items);
    SL.Items.display(aItem);
  },

  display: function(aItem) {
    var newLi = document.createElement('li');
    var newToggle = document.createElement('label');
    newToggle.className = "labelItem";
    var span = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    if (aItem.done) {
      newLi.className += " done";
      checkbox.setAttribute('checked', true);
    } 

    newToggle.addEventListener("click", function(e) {
      if (!aItem.done) {
        newLi.className += " done";
      } else {
        newLi.className = newLi.className.replace ( /(?:^|\s)done(?!\S)/g , '' );
      }
      aItem.done = newLi.getElementsByTagName("input")[0].checked;

      // Delete the item, add the updated one
      DB.deleteFromDB(aItem.guid, SL.Items);
      DB.store(aItem, SL.Items);
    });

    newToggle.appendChild(checkbox);
    newToggle.appendChild(span);


    var newTitle = document.createElement('a');
    newTitle.className = 'listElmTitle';
    newTitle.innerHTML = aItem.name;
    if (aItem.nb > 1) {
      var container = document.createElement('a');
      container.innerHTML = " x";
      var input = document.createElement('input');
      input.setAttribute('type', 'number');
      input.value = aItem.nb;
      container.appendChild(input);
      //container.insertAdjacentHTML('beforeend',
      //  '<input type="number" value="'+aItem.nb+'"/>');
      newTitle.appendChild(container);
    }

    var newDelete = document.createElement('a');
    newDelete.className = 'delete';
    newDelete.addEventListener("click", function(e) {
      newLi.style.display = "none";
      DB.deleteFromDB(aItem.guid, SL.Items);
    });

    
    newLi.dataset.listkey = aItem.guid;

    newLi.appendChild(newToggle);
    newLi.appendChild(newTitle);
    newLi.appendChild(newDelete);

    SL.Items.elm.getElementsByClassName("list")[0].appendChild(newLi);
  },
  clear: function() {
    var node = SL.Items.elm.getElementsByClassName("list")[0];
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
  }
}

/*******************************************************************************
 * enterEmail
 ******************************************************************************/
SL.enterEmail = {
  elm: SL.id("enterEmail"),
}

  // Messages handlers
  function displayActionSuccess(id) {
    SL.id('msg').innerHTML = '<span class="action-success" data-l10n-id="' + id + '"></span>';
  }
  function displayActionFailure(id) {
    SL.id('msg').innerHTML = '<span class="action-failure" data-l10n-id="' + id + '"></span>';
  }
  function resetActionStatus() {
    SL.id('msg').innerHTML = '';
  }

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// Add the eventListeners to buttons, etc.
function addEventListeners() {

  /*****************************************************************************
   * Shared
   ****************************************************************************/
    // Add event listener on every Settings button
  var els = document.getElementsByClassName("settings");
  var elsArray = Array.prototype.slice.call(els, 0);
  elsArray.forEach(function(el) {
    el.addEventListener("click", function() {
      SL.show("settingsPanel");
    });
  });

  /*****************************************************************************
   * Lists
   ****************************************************************************/
  // Add list when the user click the button…
  SL.id("add-list").addEventListener("click", function() {
    SL.Lists.new();
  });
  // …or if he hit enter key
  SL.id("listName").onkeyup = function (e) {
    if (e.keyCode == 13) {
      SL.Lists.new();
    }
  }

  SL.id("completeall").addEventListener("click",  function() {
    SL.Lists.completeall()
  });
  
  // Init event for edit view
  SL.Lists.elm.getElementsByClassName('edit')[0].addEventListener("click",
  function() {
    SL.editLists.init();
  });

  var install = SL.id('install');
  install.addEventListener('click', function(e){
    navigator.mozApps.install("http://theochevalier.fr/app/manifest.webapp");
  });

  /*****************************************************************************
   * editLists
   ****************************************************************************/
  var header = SL.editLists.elm.getElementsByTagName("header")[0];

  // Close
  header.getElementsByTagName("button")[0].addEventListener("click", function() {
    SL.hide("editLists");
    SL.show("lists");
  });

  // Delete Selected
  header.getElementsByTagName("button")[1].addEventListener("click", function() {
    SL.editLists.deleteSelected();
  });

  var menu = SL.editLists.elm.getElementsByTagName("menu")[1];

  // Select All
  menu.getElementsByTagName("button")[0].addEventListener("click", function() {
    SL.editLists.selectAll();
  });
  // Deselect All
  menu.getElementsByTagName("button")[1].addEventListener("click", function() {
    SL.editLists.deselectAll();
  });

  /*****************************************************************************
   * Items
   ****************************************************************************/
  // Add item when the user click the button…
  SL.id("add-item").addEventListener("click", SL.Items.new());
  // …or if he hit enter key
  SL.id("itemName").onkeyup = function (e) {
    if (e.keyCode == 13) {
      SL.Items.new();
    }
  }

  function addItem() {
    var name = SL.id('listName').value;
    var date = new Date();

    if (!name || name === undefined) {
      displayActionFailure("msg-name");
      return;
    }
    SL.Lists.add({ guid: guid(),
                   name: name,
                   date: date.getTime(),
                   items:{}
    });
    SL.id('listName').value ="";
  }

  // Display buttons
  SL.Items.elm.getElementsByClassName("back")[0].addEventListener("click",
  function() {
    SL.hide("items");
    SL.show("lists");
  });

  var send = SL.Items.elm.getElementsByClassName("send")[0];
  send.addEventListener("click", function() {
    SL.show("enterEmail");
  });

  /*****************************************************************************
   * send e-mail views
   ****************************************************************************/
  // Add event listeners to buttons

  //Cancel
  SL.enterEmail.elm.getElementsByClassName("cancel")[0].addEventListener("click",
    function() {
      SL.hide("enterEmail");
    });

  // Send
  SL.enterEmail.elm.getElementsByClassName("send")[0].addEventListener("click",
    function() {
      sendAddress();
    });
  // …or if he hit enter key
  SL.id("email").onkeyup = function (e) {
    if (e.keyCode == 13) {
      sendAddress();
    }
  }

  function sendAddress() {
    if (SL.id("email").value != "") {
      SL.hide("enterEmail");
      SL.show("sendEmail");
      createXHR();
      var url = "http://app.theochevalier.fr/php/email.php";
      request.open('POST', url, true);
      request.onreadystatechange = function() {
        if (request.readyState == 4) {
          console.log(request.responseText);
          SL.hide("sendEmail");
        }
      };
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      var email = SL.id("email").value;
      var data = "email=" + email + "&data=" + encodeURIComponent(SL.Items.list);
      request.send(data);
    }
  }

  function createXHR() {
    try {
      request = new XMLHttpRequest();
    } catch (microsoft) {
      try {
        request = new ActiveXObject('Msxml2.XMLHTTP');
      } catch(autremicrosoft) {
        try {
          request = new ActiveXObject('Microsoft.XMLHTTP');
        } catch(echec) {
          request = null;
        }
      }
    }
    if(request == null) {
    console.error("Can't create XHR");
    }
  }

  /*****************************************************************************
   * Settings
   ****************************************************************************/
  SL.Settings.elm.getElementsByClassName("icon-back")[0].addEventListener("click",
    function() {
      SL.hide("settingsPanel");
    });

  /*
   * Currency settings
   */
  // Show position & currency panels
  SL.id("currency").addEventListener("click",
    function() {
      SL.show("editCurrency");
    });
  SL.id("position").addEventListener("click",
    function() {
      SL.show("editPosition");
    });

  // Hide currency panel
  SL.id("cEditCurrency").addEventListener("click",
    function() {
      SL.hide("editCurrency");
    });
  SL.id("setEditCurrency").addEventListener("click",
    function() {
      SL.hide("editCurrency");
    });

  // Hide position panel
  SL.id("cEditPosition").addEventListener("click",
    function() {
      SL.hide("editPosition");
    });
  SL.id("setEditPosition").addEventListener("click",
    function() {
      SL.hide("editPosition");
    });

  /*
   * About panel
   */
  SL.id("about").addEventListener("click",
    function() {
      SL.show("aboutPanel");
    });
  SL.id("aboutBack").addEventListener("click",
    function() {
      SL.hide("aboutPanel");
    });
  SL.id("aboutClose").addEventListener("click",
    function() {
      SL.hide("aboutPanel");
    });
}


    function update() {
        var btn = SL.id('install');
        if(install.state == 'uninstalled') {
            btn.style.display = 'block';
        }
        else if(install.state == 'installed' || install.state == 'unsupported') {
            btn.style.display = 'none';
        }
    }

    function init() {
        var btn = SL.id('install');
        btn.addEventListener('click', function() {
            install();
        });

        install.on('change', update);

        install.on('error', function(e, err) {
            // Feel free to customize this
            alert('There was an error during installation.');
        });

        install.on('showiOSInstall', function() {
            // Feel free to customize this
            alert('To install, press the forward arrow in Safari ' +
                  'and touch "Add to Home Screen"');
        });
    }


       

 
// Actions that needs the DB to be ready
function finishInit() {
  // Populate the list
  SL.Lists.init();
  DB.displayList(null, SL.Lists);

  // Dynamically calculate height of content
  var height = document.body.clientHeight;
  SL.id("content").style.height = height+"px";
  var els = document.getElementsByClassName("scroll");
  var elsArray = Array.prototype.slice.call(els, 0);
  elsArray.forEach(function(el) {
    el.style.maxHeight = height-120+"px";
  });
  //init();
}

var db;
window.addEventListener("load", function() {
  DB.openDb();
  addEventListeners();
});
window.addEventListener("localized", function() {
  SL.hide("loader");
});