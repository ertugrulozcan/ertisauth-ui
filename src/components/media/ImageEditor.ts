import html2canvas from "html2canvas"
import { Crop } from "react-image-crop"
import { FileHelper } from "../../helpers/FileHelper"

export type OutputType = "base64" | "blob" | "file"
export type ImageRotation = 0 | 90 | 180 | 270

class ImageEditor {
	static async watermarkAsync(image: any, watermarkElement: HTMLElement, width: number, height: number, mimeType: string): Promise<string> {
		const canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		if (ctx) {
			canvas.width = width;
			canvas.height = height;
			ctx.fillStyle = "rgba(0, 0, 0, 0)";
			ctx.fillRect(0, 0, width, height);

			if (ctx.imageSmoothingEnabled && ctx.imageSmoothingQuality) {
				ctx.imageSmoothingQuality = 'high';
			}
			
			ctx.translate(0, 0);
			ctx.drawImage(image, 0, 0, width, height); 

			const watermarkCanvas = await html2canvas(watermarkElement, { backgroundColor: null })
			ctx.drawImage(watermarkCanvas, 0, 0, width, height); 
			
			return canvas.toDataURL(mimeType, 100);
		}
		else {
			throw Error("Context is " + ctx);
		}
	}

	private static cropImageCore(image: any, crop: Crop, displayWidth: number, displayHeight: number, mimeType: string): string {
		const canvas = document.createElement("canvas");
		const pixelRatio = window.devicePixelRatio;
		const scaleX = image.naturalWidth / displayWidth;
		const scaleY = image.naturalHeight / displayHeight;

		const ctx = canvas.getContext("2d");
		if (ctx) {
			canvas.width = crop.width * pixelRatio * scaleX;
			canvas.height = crop.height * pixelRatio * scaleY;

			ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
			ctx.imageSmoothingQuality = "high";

			ctx.drawImage(
				image,
				crop.x * scaleX,
				crop.y * scaleY,
				crop.width * scaleX,
				crop.height * scaleY,
				0,
				0,
				crop.width * scaleX,
				crop.height * scaleY
			);

			return canvas.toDataURL(mimeType, 100);
		}
		else {
			throw Error("Context is " + ctx);
		}
	}

	private static resizeImageCore(image: any, targetWidth: number, targetHeight: number, mimeType: string, quality: number = 100): string {
		var qualityDecimal = quality / 100;
		var canvas = document.createElement("canvas");
		canvas.width = targetWidth;
		canvas.height = targetHeight;
	
		var ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.fillStyle = "rgba(0, 0, 0, 0)";
			ctx.fillRect(0, 0, targetWidth, targetHeight);

			if (ctx.imageSmoothingEnabled && ctx.imageSmoothingQuality) {
				ctx.imageSmoothingQuality = 'high';
			}
			
			ctx.translate(0, 0);
			ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
			
			return canvas.toDataURL(mimeType, qualityDecimal);
		}
		else {
			throw Error("Context is " + ctx);
		}
	}

	private static rotateImageCore(image: any, mimeType: string, rotation: ImageRotation = 0): string {
		var canvas = document.createElement("canvas");
	
		let width = image.width;
		let height = image.height;
		if (rotation && (rotation === 90 || rotation === 270)) {
			width = image.height;
			height = image.width;
		} 
		
		canvas.width = width;
		canvas.height = height;
	
		var ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.fillStyle = "rgba(0, 0, 0, 0)";
			ctx.fillRect(0, 0, width, height);

			if (ctx.imageSmoothingEnabled && ctx.imageSmoothingQuality) {
				ctx.imageSmoothingQuality = 'high';
			}

			if (rotation) {
				ctx.rotate((rotation * Math.PI) / 180);
				
				if (rotation === 90) {
					ctx.translate(0, -canvas.width);
				} 
				else if (rotation === 180) {
					ctx.translate(-canvas.width, -canvas.height);
				} 
				else if (rotation === 270) {
					ctx.translate(-canvas.height, 0);
				} 
				else if (rotation === 0 || rotation === 360) {
					ctx.translate(0, 0);
				}
			}
		
			ctx.drawImage(image, 0, 0, image.width, image.height);
			
			return canvas.toDataURL(mimeType, 100);
		}
		else {
			throw Error("Context is " + ctx);
		}
	}
	
	static cropImage(bitmap: any, crop: Crop, displayWidth: number, displayHeight: number, mimeType: string, responseUriFunc: (uri: string | Blob) => any) {
		var croppedDataUrl = ImageEditor.cropImageCore(bitmap, crop, displayWidth, displayHeight, mimeType);
		responseUriFunc(croppedDataUrl);
	}

	static resizeImageFile(file: File, targetWidth: number, targetHeight: number, mimeType: string, quality: number, responseUriFunc: (uri: string | Blob) => any, outputType: OutputType = "base64") {
		const reader = new FileReader();
		if (file) {
			if (file.type && !file.type.includes("image")) {
				throw Error("File Is NOT Image!");
			} 
			else {
				reader.readAsDataURL(file);
				reader.onload = () => {
					if (reader.result) {
						var image = new Image();
						image.src = reader.result.toString();
						image.onload = function () {
							var resizedDataUrl = ImageEditor.resizeImageCore(image, targetWidth, targetHeight, mimeType, quality);
							const contentType = mimeType;
							switch (outputType) {
								case "blob":
									const blob = FileHelper.base64toBlob(resizedDataUrl, contentType);
									responseUriFunc(blob);
									break;
								case "base64":
									responseUriFunc(resizedDataUrl);
									break;
								case "file":
									let fileName = file.name;
									let fileNameWithoutFormat = fileName.toString().replace(/(png|jpeg|jpg|webp)$/i, "");
									let extension: string = "jpeg"
									if (mimeType.toLowerCase() === "image/jpg") {
										extension = "jpg"
									}
									else if (mimeType.toLowerCase() === "image/png") {
										extension = "png"
									}
									else if (mimeType.toLowerCase() === "image/webp") {
										extension = "webp"
									}
									else {
										throw "Unsupported file type!"
									}

									let newFileName = fileNameWithoutFormat.concat(extension);
									const newFile = FileHelper.base64toFile(resizedDataUrl, newFileName, contentType);
									responseUriFunc(newFile);
									break;
								default:
									responseUriFunc(resizedDataUrl);
							}
						};
					}
				};

				reader.onerror = (error: any) => {
					throw Error(error);
				};
			}
		} 
		else {
			throw Error("File Not Found!");
		}
	}

	static resizeImage(bitmap: any, targetWidth: number, targetHeight: number, mimeType: string, quality: number, responseUriFunc: (uri: string | Blob) => any) {
		var resizedDataUrl = ImageEditor.resizeImageCore(bitmap, targetWidth, targetHeight, mimeType, quality);
		responseUriFunc(resizedDataUrl);
	}

	static rotateImage(bitmap: any, mimeType: string, rotation: ImageRotation, responseUriFunc: (uri: string | Blob) => any) {
		var resizedDataUrl = ImageEditor.rotateImageCore(bitmap, mimeType, rotation);
		responseUriFunc(resizedDataUrl);
	}

	static async screenshotCoreAsync(element: HTMLElement, mimeType: string, quality: number): Promise<string> {
		const canvas = await html2canvas(element, { backgroundColor: null })
		const croppedCanvas = document.createElement('canvas')
		const ctx = croppedCanvas.getContext('2d')
		if (ctx) {
			const cropPositionTop = 0
			const cropPositionLeft = 0
			const cropWidth = canvas.width
			const cropHeight = canvas.height
	
			croppedCanvas.width = cropWidth
			croppedCanvas.height = cropHeight
	
			ctx.drawImage(
				canvas,
				cropPositionLeft,
				cropPositionTop
			)
	
			const base64Image = croppedCanvas.toDataURL(mimeType, quality)
			return base64Image
		}
		else {
			throw Error("Context is " + ctx);
		}
	}
}

const watermarkAsync = async (image: any, watermarkElement: HTMLElement, width: number, height: number, mimeType: string) => {
	return await ImageEditor.watermarkAsync(image, watermarkElement, width, height, mimeType);
}

const cropImageAsync = async (bitmap: any, crop: Crop, displayWidth: number, displayHeight: number, mimeType: string) => {
	const cropImageTask = (image: any) => new Promise(resolve => { ImageEditor.cropImage(image, crop, displayWidth, displayHeight, mimeType, uri => { resolve(uri) }); });
	return await cropImageTask(bitmap);
}

const resizeImageFileAsync = async (file: File, targetWidth: number, targetHeight: number, quality: number, mimeType: string, outputType: OutputType) => {
	const resizeImageTask = (file: File) => new Promise(resolve => { ImageEditor.resizeImageFile(file, targetWidth, targetHeight, mimeType, quality, uri => { resolve(uri) }, outputType); });
	return await resizeImageTask(file);
}

const resizeImageAsync = async (bitmap: any, targetWidth: number, targetHeight: number, quality: number, mimeType: string) => {
	const resizeImageTask = (image: any) => new Promise(resolve => { ImageEditor.resizeImage(image, targetWidth, targetHeight, mimeType, quality, uri => { resolve(uri) }); });
	return await resizeImageTask(bitmap);
}

const rotateImageAsync = async (bitmap: any, rotation: ImageRotation, mimeType: string) => {
	const rotateImageTask = (image: any) => new Promise(resolve => { ImageEditor.rotateImage(image, mimeType, rotation, uri => { resolve(uri) }); });
	return await rotateImageTask(bitmap);
}

const screenshotAsync = async (element: HTMLElement, mimeType: string, quality: number): Promise<string> => {
	return await ImageEditor.screenshotCoreAsync(element, mimeType, quality)
}

const ImageEditorModule = {
	watermarkAsync,
	cropImageAsync,
	resizeImageFileAsync,
	resizeImageAsync,
	rotateImageAsync,
	screenshotAsync
};

export default ImageEditorModule;