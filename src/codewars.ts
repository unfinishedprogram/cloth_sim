type CMD = '<'|'>'|'+'|'-'|'.'|','|'['|']';
type cmdHeaders = {
	jump_forward:boolean,
	jump_backward:boolean,
	level:number
}
export function brainLuck(code: string, input: string):string {
	let code_arr = Array.from(code);
	let in_arr = Array.from(input);
  let data_buffer = new Uint8Array(new ArrayBuffer(5000)); 
  let out_buffer = '';
  let data_ptr = 0;
  let parse_ptr = 0;
  let level = 0;

	let goToOpen = (start:number) => {
		while(true){
      if (code_arr[parse_ptr] == ']') level --;
			if (code_arr[parse_ptr] == '[') level ++;
      if(code_arr[parse_ptr] == '[' && level == start) break;
			parse_ptr--;
    }
	}

	let goToClose = (start:number) => {
		while(true){
      if (code_arr[parse_ptr] == ']') level --;
			if (code_arr[parse_ptr] == '[') level ++;
      if(code_arr[parse_ptr] == ']' && level == start) break;
      
			parse_ptr++;
    }
	}

  let commands = {
    '<': () => data_ptr--,
    '>': () => data_ptr++,
    '+': () => data_buffer[data_ptr]++,
    '-': () => data_buffer[data_ptr]--,
    '.': () => out_buffer += String.fromCharCode(data_buffer[data_ptr]),
    ',': () => data_buffer[data_ptr] = in_arr.shift()!.charCodeAt(0),
    '[': () => data_buffer[data_ptr] == 0 ? goToClose(level) : void(0),
    ']': () => data_buffer[data_ptr] != 0 ? goToOpen(level) : void(0)
  }  
  while(code_arr[parse_ptr] != undefined) {
    commands[code_arr[parse_ptr] as CMD]()  
    parse_ptr++;
  }
  return out_buffer;
}