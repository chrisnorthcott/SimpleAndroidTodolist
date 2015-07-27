/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {

        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //document.addEventListener('DOMContentLoaded', this.onLoad, false);
        // document.addEventListener('load', this.onLoad, false);

        $('#newtaskbtn').click(this.toggleNewItemVisibility);
        $('#newTaskAdd').click(function(ev){
                var taskText = $('#newTaskInput').val();
                var taskDueBy = $('#newTaskDueBy').val();
                app.addItem(taskText, taskDueBy);
                app.reloadData();
                return false;
        });

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        TodoListStorageService.initialise().done(function(){console.log("Database initialised OK")});
        app.reloadData();
    },
    // onLoad: function() {
    //     app.receivedEvent('load');
    //     TodoListStorageService.initialise().done(function(){console.log("Database initialised OK")});
    //     app.reloadData();
    //     //TodoListStorageService.create(['Test 3', '2015-07-22T17:51']);
    // },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        console.log('Received Event: ' + id);
    },
    
    //UI events
    toggleNewItemVisibility: function() {
        $("#newItemForm").toggleClass('hidden');
    },

    renderRow: function(row){
        
        var dateparts = row.dueby.split(" ");

        $.timeago.settings.allowFuture = true;
        console.log(dateparts[0]);
        var timestr = $.timeago(new Date(dateparts[0]));
        var spanClass = '';
        var sectionheader = '';
        if(timestr.indexOf('ago') > 0)
        {
            spanClass = 'badge-negative';
            if(!this.isOverdueSectionHeaderPresent)
            {
                this.isOverdueSectionHeaderPresent = true;
                sectionheader = '<li class="table-view-cell table-view-divider">Overdue</li>';
            }
        }
        else if(timestr.indexOf('minutes') > 0 || timestr.indexOf('hour') > 0)
        {
            spanClass = 'badge-primary';
            if(!this.isDueSectionHeaderPresent)
            {
                this.isOverdueSectionHeaderPresent = false;
                this.isDueSectionHeaderPresent = true;
                sectionheader = '<li class="table-view-cell table-view-divider">Due soon</li>';
            }
        }
        else{
             if(!this.isNormalSectionHeaderPresent)
            {
                this.isOverdueSectionHeaderPresent = false;
                this.isDueSectionHeaderPresent = false;
                this.isNormalSectionHeaderPresent = true
                sectionheader = '<li class="table-view-cell table-view-divider">Other tasks</li>';
            }           
        }
        console.log();
        var rowHTML = (this.isOverdueSectionHeaderPresent? sectionheader : '') +
                      (this.isDueSectionHeaderPresent? sectionheader : '') +
                        '<li class="table-view-cell" data-rowid="' + row.rowid + '">' +
                        '<a class="navigate-right">'+
                        '<span class="badge '+ spanClass+'">' + timestr + '</span>' +
                        row.text.toString() + 
                        '</a></li>';
        $('#tasklist-view').append(rowHTML);
    },

    //data events
    addItem: function(text, dueby)
    {
        console.log("Adding " + text);
        //TodoListStorageService.initialise();
        TodoListStorageService.create([text, dueby])
            .done(function(result){
                console.log("Record inserted OK.");
                //app.reloadData();
                app.toggleNewItemVisibility();
            })
            .fail(function(err){
                console.log("Create failure: " + err);
            });
    },

    removeItem: function(rowid)
    {
        console.log("Removing " + rowid);
        TodoListStorageService.delete(rowid)
            .done(function(result){
                console.log("Deleted OK")
            })
            .fail(function(err){
                console.log("Delete failure: " + err);
            });
    },

    reloadData: function(){
        console.log("Updating...");
        $('#tasklist-view').html(' ');
        TodoListStorageService.readAll()
            .done(function(result){
                console.log(result.rows.length + " records available");
                for(var i = 0; i < result.rows.length; i++)
                {
                    console.log("Rendering row " + i);
                    app.renderRow(result.rows.item(i));
                }
                //attach events to the newly-created list items
                $('#tasklist-view li').click(function(ev){
                    var rowid = parseInt($(this).data("rowid"));
                    TodoListStorageService.delete(rowid)
                        .done(function(){
                            app.reloadData();
                        })
                });
            })
            .fail(function(err){
                //todo: change to native notif
                console.log("Error: " + err);
            });
    }
};

app.initialize();