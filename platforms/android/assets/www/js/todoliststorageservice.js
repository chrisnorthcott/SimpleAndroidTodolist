var TodoListStorageService = {

	db: null,

	initialise: function(){
		var defer = $.Deferred();
		this.db = window.sqlitePlugin.openDatabase('TodoList',"1.0", "Todo List", 200000);
		this.db.transaction(
			function(tx)
			{
				tx.executeSql("CREATE TABLE IF NOT EXISTS todolistitems ( "+
					"rowid INTEGER PRIMARY KEY AUTOINCREMENT, "+
					"text VARCHAR(255),"+
					"dueby VARCHAR(24) )",[], function(tx, result)
					{
						console.log("Init success (16)");
						defer.resolve(); 
					},
					function(tx, err){
						defer.reject("Init Error (19):" + err.message);}
					);
					
			}
		);
		return defer.promise();
	},
	create: function(todolistitem)
	{
		var defer = $.Deferred();
		if(!this.db)
		{
			console.log("DB not initialised?");
		}
		this.db.transaction(function(tx)
			{
				console.log("Starting transaction....");
				var sql = "INSERT INTO todolistitems (text, dueby) VALUES (?, ?)";
				tx.executeSql(sql, todolistitem, function(tx, result){
					if(result)
					{
						defer.resolve(result);
					}
				}, function(tx, err)
				{
					defer.reject("Execute error: " + err.message);
				});
			}
		);
		return defer.promise();
	},
	read: function(itemID)
	{
		var defer = $.Deferred();
		this.db.transaction(function(tx)
		{
			var sql = "SELECT * FROM todolistitems WHERE id = ?";
			tx.executeSql(sql, [], function(tx, result){
				if(result)
				{
					defer.resolve(result);
				}
			},function(tx, err){
				defer.reject("Transaction error: " + err.message);
			});
		});
		return defer.promise();
	},
	readAll: function()
	{
		var defer = $.Deferred();
		this.db.transaction(function(tx)
		{
			var sql = "SELECT * FROM todolistitems ORDER BY datetime(dueby)";
			tx.executeSql(sql, [], function(tx, result){
				if(result)
				{
					defer.resolve(result);
				}
			}, function(tx, err){
				defer.reject("Transaction error: " + err.message);
			});
		});
		return defer.promise();
	},
	update: function()
	{
		defer.reject("Not implemented yet");
		return defer.promise();
	},
	delete: function(itemID)
	{console.log("Starting transaction (D "+itemID+")....");
		var defer = $.Deferred();
		this.db.transaction(function(tx){
			var sql = "DELETE FROM todolistitems WHERE rowid = ?";
			tx.executeSql(sql, [itemID], function(tx, result){
				if(result)
				{
					defer.resolve(result);
				}
			}, function(tx, err){
				defer.reject("Transaction error: " + err.message);
			})
		});
		return defer.promise();
	}
}