import { FileFormatType } from "../models/media/StorageFile"

export type MimeType = {
	extension: string,
	mimeType: string,
	description: string,
}

export class FileHelper {
	private static base64toByteArrays(b64Data: string, contentType: string): Uint8Array[] {
		contentType = contentType || "image/jpeg";
		var sliceSize = 512;
		var byteCharacters = atob(b64Data.toString().replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ""));
		var byteArrays = [];
	
		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);
			var byteNumbers = new Array(slice.length);
		
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
		
			var byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		return byteArrays;
	}
	
	static base64toBlob(b64Data: string, contentType: string): Blob {
		const byteArrays = FileHelper.base64toByteArrays(b64Data, contentType);
		var blob = new Blob(byteArrays, { type: contentType });
		return blob;
	}
	
	static base64toFile(b64Data: string, fileName: string, contentType: string): File {
		const byteArrays = FileHelper.base64toByteArrays(b64Data, contentType);
		const file = new File(byteArrays, fileName, { type: contentType });
		return file;
	}

	static downloadFileAsync(url: string, filename: string, mimeType: string): Promise<File> {
        return (fetch(url)
            .then(function(res)
			{
				return res.arrayBuffer();
			})
            .then(function(buf)
			{
				return new File([buf], filename, { type:mimeType });
			})
        );
    }

	static createImageAsync(src: any): any {
		try
		{
			return new Promise((resolve, reject) => {
				const image = new Image();
				image.addEventListener("load", () => resolve(image));
				image.addEventListener("error", (error) => reject(error));
				image.setAttribute("crossOrigin", "anonymous");
				image.src = src;
			});
		}
		catch (ex) {
			console.error(ex)
		}
	}

	static toSizeString(size: number): string {
		if (size > 0) {
			const tb = 1024 * 1024 * 1024 * 1024
			const gb = 1024 * 1024 * 1024
			const mb = 1024 * 1024
			const kb = 1024

			if (size >= tb) {
				return `${(size / tb).toFixed(2).replace(/[.,]00$/, "")} TB`
			} 
			else if (size >= gb) {
				return `${(size / gb).toFixed(2).replace(/[.,]00$/, "")} GB`
			} 
			else if (size >= mb) {
				return `${(size / mb).toFixed(2).replace(/[.,]00$/, "")} MB`
			} 
			else if (size >= kb) {
				return `${(size / kb).toFixed(2).replace(/[.,]00$/, "")} KB`
			} 
			else {
				return `${size} bytes`
			}
		} 
		else {
			return `0 bytes`
		}
	}

	static isTextFile(mimeType: string): boolean {
		if (mimeType.startsWith("text/") || mimeType === "application/json" || mimeType === "application/xml" || mimeType === "application/xhtml+xml") {
			return true
		}		
		
		return false
	}

	static isImageFile(mimeType: string): boolean {
		return mimeType.startsWith("image/")
	}

	static isEditableImageFile(mimeType_: string): boolean {
		const mimeType = mimeType_.toLowerCase()
		return mimeType === "image/jpg" || mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp"
	}

	static formatTypeToAccept(formatType: FileFormatType | undefined): MimeType[] | undefined {
		if (formatType) {
			switch (formatType) {
				case "Unknown":
					return undefined;
				case "Application":
					return [FileHelper.getAllApplicationMimeTypes()]
				case "Audio":
					return [FileHelper.getAllAudioMimeTypes()]
				case "Font":
					return [FileHelper.getAllFontMimeTypes()]
				case "Example":
					return [FileHelper.getAllExampleMimeTypes()]
				case "Image":
					return [FileHelper.getAllImageMimeTypes()]
				case "Message":
					return [FileHelper.getAllMessageMimeTypes()]
				case "Model":
					return [FileHelper.getAllModelMimeTypes()]
				case "Multipart":
					return [FileHelper.getAllMultipartMimeTypes()]
				case "Text":
					return [FileHelper.getAllTextMimeTypes()]
				case "Video":
					return [FileHelper.getAllVideoMimeTypes()]
			}
		}
	}

	static getMimeType(mimeType: string): MimeType | undefined {
		return FileHelper.mimeTypes.find(x => x.mimeType === mimeType)
	}

	static getAllImageMimeTypes(): MimeType {
		return FileHelper.getMimeType("image/*") || {} as MimeType
	}

	static getAllVideoMimeTypes(): MimeType {
		return FileHelper.getMimeType("video/*") || {} as MimeType
	}

	static getAllAudioMimeTypes(): MimeType {
		return FileHelper.getMimeType("audio/*") || {} as MimeType
	}

	static getAllApplicationMimeTypes(): MimeType {
		return FileHelper.getMimeType("application/*") || {} as MimeType
	}

	static getAllFontMimeTypes(): MimeType {
		return FileHelper.getMimeType("font/*") || {} as MimeType
	}

	static getAllExampleMimeTypes(): MimeType {
		return FileHelper.getMimeType("example/*") || {} as MimeType
	}

	static getAllMessageMimeTypes(): MimeType {
		return FileHelper.getMimeType("message/*") || {} as MimeType
	}

	static getAllModelMimeTypes(): MimeType {
		return FileHelper.getMimeType("model/*") || {} as MimeType
	}

	static getAllMultipartMimeTypes(): MimeType {
		return FileHelper.getMimeType("multipart/*") || {} as MimeType
	}

	static getAllTextMimeTypes(): MimeType {
		return FileHelper.getMimeType("text/*") || {} as MimeType
	}

	static mimeTypes: MimeType[] = [
		{
			extension: "",
			mimeType: "audio/*",
			description: "All Audio Formats",
		},
		{
			extension: "",
			mimeType: "video/*",
			description: "All Video Formats",
		},
		{
			extension: "",
			mimeType: "image/*",
			description: "All Image Formats",
		},
		{
			extension: ".aac",
			mimeType: "audio/aac",
			description: "AAC audio",
		},
		{
			extension: ".abw",
			mimeType: "application/x-abiword",
			description: "AbiWord document",
		},
		{
			extension: ".arc",
			mimeType: "application/x-freearc",
			description: "Archive document (multiple files embedded)",
		},
		{
			extension: ".avif",
			mimeType: "image/avif",
			description: "AVIF image",
		},
		{
			extension: ".avi",
			mimeType: "video/x-msvideo",
			description: "AVI: Audio Video Interleave",
		},
		{
			extension: ".azw",
			mimeType: "application/vnd.amazon.ebook",
			description: "Amazon Kindle eBook format",
		},
		{
			extension: ".bin",
			mimeType: "application/octet-stream",
			description: "Any kind of binary data",
		},
		{
			extension: ".bmp",
			mimeType: "image/bmp",
			description: "Windows OS/2 Bitmap Graphics",
		},
		{
			extension: ".bz",
			mimeType: "application/x-bzip",
			description: "BZip archive",
		},
		{
			extension: ".bz2",
			mimeType: "application/x-bzip2",
			description: "BZip2 archive",
		},
		{
			extension: ".cda",
			mimeType: "application/x-cdf",
			description: "CD audio",
		},
		{
			extension: ".csh",
			mimeType: "application/x-csh",
			description: "C-Shell script",
		},
		{
			extension: ".css",
			mimeType: "text/css",
			description: "Cascading Style Sheets (CSS)",
		},
		{
			extension: ".csv",
			mimeType: "text/csv",
			description: "Comma-separated values (CSV)",
		},
		{
			extension: ".doc",
			mimeType: "application/msword",
			description: "Microsoft Word",
		},
		{
			extension: ".docx",
			mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			description: "Microsoft Word (OpenXML)",
		},
		{
			extension: ".eot",
			mimeType: "application/vnd.ms-fontobject",
			description: "MS Embedded OpenType fonts",
		},
		{
			extension: ".epub",
			mimeType: "application/epub+zip",
			description: "Electronic publication (EPUB)",
		},
		{
			extension: ".gz",
			mimeType: "application/gzip",
			description: "GZip Compressed Archive",
		},
		{
			extension: ".gif",
			mimeType: "image/gif",
			description: "Graphics Interchange Format (GIF)",
		},
		{
			extension: ".htm",
			mimeType: "text/html",
			description: "HyperText Markup Language (HTML)",
		},
		{
			extension: ".html",
			mimeType: "text/html",
			description: "HyperText Markup Language (HTML)",
		},
		{
			extension: ".ico",
			mimeType: "image/vnd.microsoft.icon",
			description: "Icon format",
		},
		{
			extension: ".ics",
			mimeType: "text/calendar",
			description: "iCalendar format",
		},
		{
			extension: ".jar",
			mimeType: "application/java-archive",
			description: "Java Archive (JAR)",
		},
		{
			extension: ".jpg",
			mimeType: "image/jpeg",
			description: "JPEG images",
		},
		{
			extension: ".jpeg",
			mimeType: "image/jpeg",
			description: "JPEG images",
		},
		{
			extension: ".js",
			mimeType: "text/javascript",
			description: "JavaScript",
		},
		{
			extension: ".json",
			mimeType: "application/json",
			description: "JSON format",
		},
		{
			extension: ".jsonld",
			mimeType: "application/ld+json",
			description: "JSON-LD format",
		},
		{
			extension: ".mid",
			mimeType: "audio/midi audio/x-midi",
			description: "Musical Instrument Digital Interface (MIDI)",
		},
		{
			extension: ".midi",
			mimeType: "audio/midi audio/x-midi",
			description: "Musical Instrument Digital Interface (MIDI)",
		},
		{
			extension: ".mjs",
			mimeType: "text/javascript",
			description: "JavaScript module",
		},
		{
			extension: ".mp3",
			mimeType: "audio/mpeg",
			description: "MP3 audio",
		},
		{
			extension: ".mp4",
			mimeType: "video/mp4",
			description: "MP4 video",
		},
		{
			extension: ".mpeg",
			mimeType: "video/mpeg",
			description: "MPEG Video",
		},
		{
			extension: ".mpkg",
			mimeType: "application/vnd.apple.installer+xml",
			description: "Apple Installer Package",
		},
		{
			extension: ".odp",
			mimeType: "application/vnd.oasis.opendocument.presentation",
			description: "OpenDocument presentation document",
		},
		{
			extension: ".ods",
			mimeType: "application/vnd.oasis.opendocument.spreadsheet",
			description: "OpenDocument spreadsheet document",
		},
		{
			extension: ".odt",
			mimeType: "application/vnd.oasis.opendocument.text",
			description: "OpenDocument text document",
		},
		{
			extension: ".oga",
			mimeType: "audio/ogg",
			description: "OGG audio",
		},
		{
			extension: ".ogv",
			mimeType: "video/ogg",
			description: "OGG video",
		},
		{
			extension: ".ogx",
			mimeType: "application/ogg",
			description: "OGG",
		},
		{
			extension: ".opus",
			mimeType: "audio/opus",
			description: "Opus audio",
		},
		{
			extension: ".otf",
			mimeType: "font/otf",
			description: "OpenType font",
		},
		{
			extension: ".png",
			mimeType: "image/png",
			description: "Portable Network Graphics",
		},
		{
			extension: ".pdf",
			mimeType: "application/pdf",
			description: "Adobe Portable Document Format (PDF)",
		},
		{
			extension: ".php",
			mimeType: "application/x-httpd-php",
			description: "Hypertext Preprocessor (Personal Home Page)",
		},
		{
			extension: ".ppt",
			mimeType: "application/vnd.ms-powerpoint",
			description: "Microsoft PowerPoint",
		},
		{
			extension: ".pptx",
			mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			description: "Microsoft PowerPoint (OpenXML)",
		},
		{
			extension: ".rar",
			mimeType: "application/vnd.rar",
			description: "RAR archive",
		},
		{
			extension: ".rtf",
			mimeType: "application/rtf",
			description: "Rich Text Format (RTF)",
		},
		{
			extension: ".sh",
			mimeType: "application/x-sh",
			description: "Bourne shell script",
		},
		{
			extension: ".svg",
			mimeType: "image/svg+xml",
			description: "Scalable Vector Graphics (SVG)",
		},
		{
			extension: ".tar",
			mimeType: "application/x-tar",
			description: "Tape Archive (TAR)",
		},
		{
			extension: ".tif",
			mimeType: "image/tiff",
			description: "Tagged Image File Format (TIFF)",
		},
		{
			extension: ".tiff",
			mimeType: "image/tiff",
			description: "Tagged Image File Format (TIFF)",
		},
		{
			extension: ".ts",
			mimeType: "video/mp2t",
			description: "MPEG transport stream",
		},
		{
			extension: ".ttf",
			mimeType: "font/ttf",
			description: "TrueType Font",
		},
		{
			extension: ".txt",
			mimeType: "text/plain",
			description: "Text, (generally ASCII or ISO 8859-n)",
		},
		{
			extension: ".vsd",
			mimeType: "application/vnd.visio",
			description: "Microsoft Visio",
		},
		{
			extension: ".wav",
			mimeType: "audio/wav",
			description: "Waveform Audio Format",
		},
		{
			extension: ".weba",
			mimeType: "audio/webm",
			description: "WEBM audio",
		},
		{
			extension: ".webm",
			mimeType: "video/webm",
			description: "WEBM video",
		},
		{
			extension: ".webp",
			mimeType: "image/webp",
			description: "WEBP image",
		},
		{
			extension: ".woff",
			mimeType: "font/woff",
			description: "Web Open Font Format (WOFF)",
		},
		{
			extension: ".woff2",
			mimeType: "font/woff2",
			description: "Web Open Font Format (WOFF)",
		},
		{
			extension: ".xhtml",
			mimeType: "application/xhtml+xml",
			description: "XHTML",
		},
		{
			extension: ".xls",
			mimeType: "application/vnd.ms-excel",
			description: "Microsoft Excel",
		},
		{
			extension: ".xlsx",
			mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			description: "Microsoft Excel (OpenXML)",
		},
		{
			extension: ".xml",
			mimeType: "application/xml",
			description: "XML	",
		},
		{
			extension: ".xul",
			mimeType: "application/vnd.mozilla.xul+xml",
			description: "XUL",
		},
		{
			extension: ".zip",
			mimeType: "application/zip",
			description: "ZIP archive",
		},
		{
			extension: ".3gp",
			mimeType: "video/3gpp",
			description: "3GPP audio/video container",
		},
		{
			extension: ".3g2",
			mimeType: "video/3gpp2",
			description: "3GPP2 audio/video container",
		},
		{
			extension: ".7z",
			mimeType: "application/x-7z-compressed",
			description: "7-zip archive",
		}
	];
}