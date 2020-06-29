var file_input,file_list,submit_btn,upload_form,uploaders=[];
$(document).ready(Initialize);


//Initialisation
	function Initialize()
	{
		FILE_API_CHECK();

		//DOM Object Creation
		
		file_input = $('#file_input'),file_list = $('#file_list'),submit_btn = $('#submit_btn'),upload_form = $('#upload_form');

		file_input.on('change', onFileSelected);
		upload_form.on('submit', onFormSubmit);
	};


//Utility Functions

	/**
	 * Utility method to format bytes into the most logical magnitude (KB, MB,
	 * or GB).
	 */
	Number.prototype.formatBytes = function() 
	{
	    var units = ['B', 'KB', 'MB', 'GB', 'TB'],bytes = this,i;
	    for (i = 0; bytes >= 1024 && i < 4; i++) 
	    {
		bytes /= 1024;
	    }
	 
	    return bytes.toFixed(2) + units[i];
	};
	
	function FILE_API_CHECK()
	{
			if (window.File && window.FileReader && window.FileList && window.Blob) 
			{
				alert("File API supported.!");
			} 
			else 
			{
				alert("The File APIs are not fully supported in this browser.");

				//call to alternate functions
			}
	};

	function _upload(handle)
	{
		var chunk;
		console.log(handle);
		// Slight timeout needed here (File read / AJAX readystate conflict?)
		setTimeout(function() 
		{
			// Prevent range overflow 
			//console.log("Cheking overflow"+ handle.range_end +","+ handle.file_size);
			if(handle.range_end > handle.file_size) 
			{
				handle.range_end = handle.file_size;
			}
			chunk = handle.file[handle.slice_method](handle.range_start, handle.range_end);
			console.log(chunk);
			//		chunk.name='something';
			//		chunk.type='File';			    			
			handle.upload_request.open('POST', handle.options.url, true);
			handle.upload_request.overrideMimeType('application/octet-stream');
			if (handle.range_start !== 0) 
			{
				handle.upload_request.setRequestHeader('Content-Range','bytes '+ handle.range_start+'-'+handle.range_end+'/'+handle.file_size);
			}
			var data = new FormData();
			data.append("chunk_name",handle.file_name+"."+handle.iter);
			//chunk.name="chunk1";
			data.append("userfile", chunk);
			//console.log(data);	
			handle.upload_request.send(data);
			// TODO
			// From the looks of things, jQuery expects a string or a map
			// to be assigned to the "data" option. We'll have to use
			// XMLHttpRequest object directly for now...
			/*$.ajax(handle.options.url, {
			data: chunk,
			type: 'PUT',
			mimeType: 'application/octet-stream',
			headers: (handle.range_start !== 0) ? {
			'Content-Range': ('bytes ' + handle.range_start + '-' + handle.range_end + '/' + handle.file_size)
			} : {},
			success: handle._onChunkComplete
			});*/
		}, 10);
	};
	
	function _onChunkComplete(handle)
	{
			// If the end range is already the same size as our file, we
			// can assume that our last chunk has been processed and exit
			// out of the function.
			//console.log(refer.range_end +","+ refer.file_size);
			console.log(handle);
			if(handle.range_end === handle.file_size) 
			{
				//this._onUploadComplete();
				alert("completed");
				return;
			}

			// Update our ranges
			handle.range_start = handle.range_end;
			handle.range_end = handle.range_start + handle.chunk_size;
			handle.iter++;
			console.log("update");
			// Continue as long as we aren't paused
			if (!handle.is_paused) 
			{
				_upload(handle);
			}
	};
	
	function start(handle)
	{
		_upload(handle)
	};
	
	function pause(handle)
	{
		handle.is_paused = true;
	};
	
	function resume(handle)
	{
		handle.is_paused = false;
		_upload(handle);
	};

// DOM Event Functions


	/**
	* Loops through the selected files, displays their file name and size
	* in the file list, and enables the submit button for uploading.
	*/


	function onFileSelected(e)
	{
		//console.log(e.target.files);

		var files = e.target.files;
		for (var i = 0; i < files.length; i++) 
		{
			file = files[i];
			uploaders.push(new ChunkedUploader(file));
			file_list.append('<li>' + files[i].name + '(' + files[i].size.formatBytes() + ') <button class="pausebutton" style="display:none">Pause</button> </li>');
		}

		file_list.find('button').on('click', onPauseClick);
		file_list.show();
		submit_btn.attr('disabled', false);
	};

	/**
	* Loops through all known uploads and starts each upload
	* process, preventing default form submission.
	*/


	function onFormSubmit(e) 
	{
		//$('.pausebutton').show();
		//submit_btn.hide();
		$.each(uploaders, function(i, uploader){ start(uploader);});
		// Prevent default form submission
		e.preventDefault();
	};

	/**
	* Toggles pause method of the button's related uploader instance.
	*/
	function onPauseClick(e) 
	{
		var btn = e.target,uploader = btn.parent('li').data('uploader');
		if (btn.hasClass('paused'))
		{
			btn.removeClass('paused').text('Pause');
			resume(uploader);
		}
		else
		{
			btn.addClass('paused').text('Resume');
			pause(uploader);
		}
	};

	function ChunkedUploader(file, options) 
	{
		if (!this instanceof ChunkedUploader) 
		{
			return new ChunkedUploader(file, options);
		}
		this.file = file;
		//var refer=this;
		this.options = $.extend({url: 'upload.php'}, options);
		console.log(this.file.name);
		this.file_name=this.file.name;
		this.file_size = this.file.size;
		this.chunk_size = (1024 * 100); // 100KB
		this.range_start = 0;
		this.range_end = this.chunk_size;
		this.is_paused=false;
		if ('mozSlice' in this.file) 
		{
			this.slice_method = 'mozSlice';
		}
		else if ('webkitSlice' in this.file) 
		{
			this.slice_method = 'webkitSlice';
		}
		else 
		{
			this.slice_method = 'slice';
		}
		refer=this;
		this.iter=0;
		this.upload_request = new XMLHttpRequest();
		this.upload_request.onreadystatechange=function()
							{
								if (this.readyState==4 && this.status==200)
									_onChunkComplete(refer);
							};
	};









