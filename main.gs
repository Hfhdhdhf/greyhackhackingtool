print("Eclipe OS admin menu\n")
while true
	a = user_input("<b>command: ")
	potato = a.split(" ")
	metaxploit = include_lib("/lib/metaxploit.so")
	ip = ""
	port = ""
	quit = function(shell, pass)
		print("Password for root:")
		get_shell.launch("/bin/crack", pass)
		shell.start_terminal
	end function
	if len(potato) > 0 then
		first = potato[0]
	end if
	if len(potato) > 1 then
		sec = potato[1]
	end if
	if len(potato) > 2 then
		third = potato[2]
	end if
	if first == "ssh" then
		cred = sec.split("@")
		user = cred[0]
		pass = cred[1]
		ip = third
		shell = get_shell.connect_service(ip, 22, user, pass)
		shell.start_terminal
	end if
	if first == "scan" then
		get_shell.launch("/bin/nmap", sec)
	end if
	if first == "help" then
		print("ssh [user@pass] [ip]    ssh connect")
		print("hack: [ip] [port]       remote hack someone")
		print("scan: [ip]              check ports for hack command")
	else if first == "hack" then
		ip = sec
		port = third.val
		passinject = user_input("enter password: ")
		net_session = metaxploit.net_use(sec,port)
		shell = null
		pass = null
		if not net_session then
			print("F")
		end if
		metaLib = net_session.dump_lib
		memory = metaxploit.scan(metaLib)
		for mem in memory
			address = metaxploit.scan_address(metaLib,mem).split("Unsafe check:")
			for add in address
				if shell and pass then
					quit(shell,pass)
				end if
				value = add[add.indexOf("<b>") + 3 : add.indexOf("</b>")]
				value = value.replace("\n", "")
				result = metaLib.overflow(mem, value, passinject)
				if typeof(result) != "shell" and typeof(result) != "computer" then
					continue
				end if
				if typeof(result) == "shell" then
					shell = result
					comp = result.host_computer
				end if
				if typeof(result) == "computer" then
					comp = result
				end if
				file = comp.File("/etc/passwd")
				cont = file.get_content
				if not cont then
					continue
				end if
				pass = cont.split("\n")[0]
				if shell then
					quit(shell, pass)
				end if
			end for
		end for
	end if
end while
