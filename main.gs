metaxploit = include_lib("/lib/metaxploit.so")
ip = ""
port = ""
inj = ""
parse = function(result)
		       found = 0
		       List = []
		       line = result.split(" ")
		       line.reverse
		   for word in line
			if found == 1 then
				word = word.remove(".")
				word = word.remove("<b>")
				word = word.remove("</b>")
				List.push(word)
				found = 0
			end if
		  
		    if found == 0 then
			if word == "Buffer" then
			   found = 1
		  end if
		  end if
		  end for
		    return List
end function  

HandleResult = function(result)
	if typeof(result) == "computer" then
		print("GOT COMPUTER!")
		print("<color=#DC5B16FF>1.  Passwd/Mail/Bank info")
		print("<color=#DC5B16FF>2.  Change passwd [root]")
		print("<color=#DC5B16FF>3.  Show remote processes")
		print("<color=#DC5B16FF>4.  Kill process[root]")
		print("5: secure (destroys pc)")
		print("<color=#DC5B16FF><i><u>Press 'Enter' to continue scanning")			
		c = user_input("<color=#DC5B16FF><u>Answer: ").to_int
		
		if typeof(c) == "number" then
			if c == 1 then
				pwd = result.File("/etc/passwd")
				if pwd then
					if pwd.has_permission("r") then
						print("\n<color=#FF00BF>Passwd: " + pwd.get_content)
					else
						print("you aint no have perms")
					end if
				end if
			end if	
			
			if c == 2 then
				user = user_input("username: ")
				cp = result.change_password(user, "0")
				if cp == true then
					print("Done.")
				else
					print(cp + "\n")
				end if
			end if
			if c == 5 then
				sec = result.File("/")
				sec.chmod("u-wrx", true)
			end if
			
			HandleResult(result)
		else
			return "proceeding.."
		end if
	end if
	if typeof(result) == "shell" then
		print("Got shell")
		print("1: Start terminal")
		print("2: Download files")
		print("3: Mail/Bank info")
		print("4: secure (destroy)")
		print("Press enter to continue scanning")

		c = user_input("Answer: ").to_int
		if typeof(c) == "number" then
			if c == 3 then
				home = result.host_computer.File("/home")
				if not home then exit("Could not find /home")
				users = home.get_folders
				for user in users
					bank = result.host_computer.File("/home/" + user.name + "/Config/Bank.txt")
					if bank then 
						if bank.has_permission("r") then
							print("Bank:" + bank.get_content)
						else
							print("Bank: Permission denied.")
						end if
					end if
				end for
			end if
			if c == 2 then
				filedest = user_input("path: ")
				dest = "/root"
				remote = get_shell
				response = result.scp(filedest, dest, remote)
				if typeof(response) == "string" then print("SCP: " + response)
			end if
			if c == 1 then
				result.start_terminal
			end if
			if c == 4 then
				sec = result.File("/")
				sec.chmod("u-wrx", true)
			end if
			HandleResult(result)
		else
			return "proceeding.."
		end if
	end if
end function

main = function()
	while true
		command = user_input("b@b 192.168.0.2 :> ")
		args = command.split(" ")
		if args[0] == "rhost" then
			ip = args[1]
			print("[+] RHOST: " + ip)
		end if
		if args[0] == "rscan" then
			port = args[1].to_int
			if args.len == 3 then inj = args[2]
			nets = metaxploit.net_use(ip,port)
			if not nets then exit("Error: " + nets)

			tL = nets.dump_lib
			memorys = metaxploit.scan(tL)
			for memory in memorys
				results = metaxploit.scan_address(tL,memory)
				for payload in parse(results)
					result = tL.overflow(memory,payload,inj)
					print("<color=yellow>" + typeof(result) + " " + memory + " " + payload)
					respons = HandleResult(tL.overflow(memory,payload,inj)) 
					print(respons)
				end for
			end for
		end if
	end while
end function

main
		
