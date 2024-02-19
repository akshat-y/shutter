let cropper
(function() {
        
    $(document).ready(function() {
        activateImageSelection();
        loadEventListeners()
    });

    const imageFilters = {
        "contrast": "1",
        "saturate": "100%",
        "brightness": "100%",
        "blur": "0px",
        "hue-rotate": "0deg",
        "drop-shadow": "0px 0px 0px black"
    }

    let imageBorderRadius = "0"

    let aspectRatioLocked = true

    function activateImageSelection() {
        if (cropper)
            cropper.destroy();

        const image = document.getElementById('target');
        const imageInitialWidth = 800
        cropper = new Cropper(image, {
            modal: false,
            dragMode: 'move',
            zoomOnWheel: true,
            background: false,
            toggleDragModeOnDblclick: false,
            center: true,
            autoCrop: false,
            guides: false,
            viewMode: 1,
            minZoom: 0.5,
            responsive: false,
            ready() {
                const canvasData = cropper.getCanvasData();
                const imageData = cropper.getImageData();
                const scale = imageInitialWidth / imageData.width
                const top = (canvasData.height - (imageData.height * scale)) / 2; 
                const left = ($(document).width() - imageInitialWidth) / 2; 
                cropper.scale(scale)

                document.getElementById('image-width').value = imageData.width * scale
                document.getElementById('image-height').value = imageData.height * scale

                document.getElementById('image-x').value = left
                document.getElementById('image-y').value = top

                cropper.setCanvasData({ 
                    // width: imageInitialWidth,
                    top: top,
                    left: left - 100
                });                
            },
        });

        image.addEventListener('crop', function(event) {
            const canvasData = cropper.getCanvasData();
            document.getElementById('image-x').value = parseInt(canvasData.left)
            document.getElementById('image-y').value = parseInt(canvasData.top)
            document.getElementById('image-width').value = parseInt(canvasData.width )
            document.getElementById('image-height').value = parseInt(canvasData.height )
        });
    }

    function loadEventListeners(){        

        const blur_event_elements = ['image-x', 'image-y', 'rotate-degree', 'image-border-radius', 'image-width', 'image-height', 'drop-shadow-x', 'drop-shadow-y', 'drop-shadow-blur']
        blur_event_elements.forEach(element => {
            document.getElementById(element).addEventListener('keydown', (event) => {
                if (event.key == 'Enter') 
                    document.getElementById(element).blur()

                const allowedKeys = ['Backspace', 'Tab', '-', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']
                if(isNaN(event.key) && (!allowedKeys.includes(event.key)) )
                    event.preventDefault()
            })
        });
        
        document.getElementById('rotate-degree').addEventListener('blur', function() {
            const value = this.value;
            if(!value.includes('°'))
                this.value = value + '°';
            cropper.rotateTo(value)
        });

        document.getElementById('image-border-radius').addEventListener('blur', function() {
            const value = this.value;
            imageBorderRadius = value
            cropper.image.style.borderRadius = value + 'px'
            document.getElementById('target').style.borderRadius = value + 'px'
            cropper.viewBoxImage.style.borderRadius = value + 'px'
            cropper.sizingImage.style.borderRadius = value + 'px'
            cropper.element.style.borderRadius = value + 'px'       
        })        
        
        document.getElementById('image-x').addEventListener('blur', function() {
            const canvasData = cropper.getCanvasData()
            canvasData["left"] = parseInt(this.value)
            cropper.setCanvasData(canvasData)
        })
        document.getElementById('image-y').addEventListener('blur', function() {
            const canvasData = cropper.getCanvasData()
            canvasData["top"] = parseInt(this.value)
            cropper.setCanvasData(canvasData)
        })

        document.getElementById('image-width').addEventListener('blur', function() {
            const width = this.value;
            const imageData = cropper.getImageData();
            const scale = width / imageData.width
            aspectRatioLocked ? cropper.scale(scale) : cropper.scaleX(scale)
            aspectRatioLocked ? document.getElementById('image-height').value = Math.round(cropper.getImageData().height * scale) : ''
        })

        document.getElementById('image-height').addEventListener('blur', function() {
            const height = this.value;
            const imageData = cropper.getImageData();
            const scale = height / imageData.height
            aspectRatioLocked ? cropper.scale(scale) : cropper.scaleY(scale)            
            aspectRatioLocked ? document.getElementById('image-width').value = Math.round(cropper.getImageData().width * scale) : ''
        })

        document.getElementById('lock-aspect-ratio').addEventListener('click', function() {
            aspectRatioLocked = !aspectRatioLocked
            if(aspectRatioLocked)
                this.classList.add('active')
            else
                this.classList.remove('active')
        })        
        
        document.getElementById('brightnessSlider').addEventListener('input', function() {
            document.getElementById('brightnessValue').textContent = this.value + '%'
            imageFilters["brightness"] = this.value + '%'
            applyFilters()
        })

        document.getElementById('contrastSlider').addEventListener('input', function() {
            document.getElementById('contrastValue').textContent = this.value
            imageFilters["contrast"] = this.value
            applyFilters()
        })

        document.getElementById('hueSlider').addEventListener('input', function() {
            document.getElementById('hueValue').textContent = this.value
            imageFilters["hue-rotate"] = this.value + 'deg'
            applyFilters()
        })

        document.getElementById('blurSlider').addEventListener('input', function() {
            document.getElementById('blurValue').textContent = this.value
            imageFilters["blur"] = this.value + "px"
            applyFilters()
        })

        document.getElementById('saturationSlider').addEventListener('input', function() {
            document.getElementById('saturationValue').textContent = this.value + '%'
            imageFilters["saturate"] = this.value + '%'
            applyFilters()
        })

        document.getElementById('crop-btn').addEventListener('click', function() {
            removeActiveOption()
            this.classList.add("active");
            document.getElementById('crop-options').classList.add('visible')
            document.getElementById('crop-actions').classList.add('visible')

            cropper.setDragMode('crop');
        })

        document.getElementById('move-btn').addEventListener('click', function() {
            removeActiveOption()
            this.classList.add("active");
            document.getElementById('crop-options').classList.remove('visible')
            document.getElementById('crop-actions').classList.remove('visible')

            cropper.setDragMode('move');
            cropper.clear();
        })

        document.getElementById('confirm-crop').addEventListener('click', function() {
            cropImage()
            document.getElementById('move-btn').click()            
        })

        document.getElementById('cancel-crop').addEventListener('click', function() {
            cropper.clear();
        })

        document.getElementById('flip-horrizontal-btn').addEventListener('click', function() {
            const imageData = cropper.getImageData()
            cropper.scaleX(imageData.scaleX * -1)
        })
        document.getElementById('flip-vertical-btn').addEventListener('click', function() {
            const imageData = cropper.getImageData()
            cropper.scaleY(imageData.scaleY * -1)
        })

        document.querySelectorAll('#crop-options .ar').forEach(element => {
            element.addEventListener('click', () => {
                const aspectRatio = element.dataset.aspectratio;
                cropper.setAspectRatio(aspectRatio)
            });
        })                

        document.getElementById('download-image').addEventListener('click', function() {
            this.classList.add('loading')
            downloadImage()
        })

        document.getElementById('upload-image').addEventListener('click', function() {
            document.getElementById('upload-image-input').click();
        })

        document.getElementById('upload-image-input').addEventListener('change', function(event) {
            var file = event.target.files[0];
            if (!file) return;
            
            var reader = new FileReader();
            reader.onload = function(event) {
                cropper.replace(event.target.result);
            };
            reader.readAsDataURL(file);

            resetFilters()
        });

        document.getElementById('drop-shadow-color').addEventListener('input', function(event) {
            const color = this.value
            const x = document.getElementById('drop-shadow-x').value
            const y = document.getElementById('drop-shadow-y').value
            const blur = document.getElementById('drop-shadow-blur').value
            imageFilters["drop-shadow"] = `${x}px ${y}px ${blur}px ${color}`
            document.getElementById('drop-shadow-color-value').value = color
            applyFilters()
        })

        document.getElementById('drop-shadow-x').addEventListener('blur', function() {
            const x = this.value
            const y = document.getElementById('drop-shadow-y').value
            const blur = document.getElementById('drop-shadow-blur').value
            const color = document.getElementById('drop-shadow-color').value
            imageFilters["drop-shadow"] = `${x}px ${y}px ${blur}px ${color}`
            applyFilters()
        })
        document.getElementById('drop-shadow-y').addEventListener('blur', function() {
            const y = this.value
            const x = document.getElementById('drop-shadow-x').value
            const blur = document.getElementById('drop-shadow-blur').value
            const color = document.getElementById('drop-shadow-color').value
            imageFilters["drop-shadow"] = `${x}px ${y}px ${blur}px ${color}`
            applyFilters()
        })
        document.getElementById('drop-shadow-blur').addEventListener('blur', function() {
            const blur = this.value
            const x = document.getElementById('drop-shadow-x').value
            const y = document.getElementById('drop-shadow-y').value            
            const color = document.getElementById('drop-shadow-color').value
            imageFilters["drop-shadow"] = `${x}px ${y}px ${blur}px ${color}`
            applyFilters()
        })

        
    }

    function removeActiveOption(){
        document.getElementById('options-container').querySelectorAll('.active').forEach(function(element) {
            element.classList.remove('active');
        });
    }
    
    async function cropImage(){
        var imgurl =  await cropper.getCroppedCanvas().toDataURL();
        cropper.replace(imgurl);        
        cropper.clear();        
        setTimeout(() => { applyFilters() }, 0);
        setTimeout(() => { applyFilters() }, 100);
    }

    function applyFilters(){
        const filters = getImageFilters()
        cropper.image.style.filter = filters
        document.getElementById('target').style.filter = filters
        cropper.viewBoxImage.style.filter = filters
        cropper.sizingImage.style.filter = filters
        cropper.element.style.filter = filters
        
        cropper.image.style.borderRadius = imageBorderRadius + 'px'
        document.getElementById('target').style.borderRadius = imageBorderRadius + 'px'
        cropper.viewBoxImage.style.borderRadius = imageBorderRadius + 'px'
        cropper.sizingImage.style.borderRadius = imageBorderRadius + 'px'
        cropper.element.style.borderRadius = imageBorderRadius + 'px'
    }

    function getImageFilters(){
        let filters = ""
        for(const filter in imageFilters){
            filters += ` ${filter}(${imageFilters[filter]})`
        }
        return filters
    }

    function downloadImage() {

        var croppedCanvas = cropper.getCroppedCanvas()

        var outputCanvas = document.createElement('canvas')
        var outputCanvas1 = document.createElement('canvas')
        var outputContext = outputCanvas.getContext('2d')
        var outputContext1 = outputCanvas1.getContext('2d')

        const dropShadow = imageFilters["drop-shadow"]
        let [dropShadowX, dropShadowY, dropShadowBlur, dropShadowColor] = dropShadow.split(" ");
        dropShadowX = Math.abs(parseInt(dropShadowX))
        dropShadowY = Math.abs(parseInt(dropShadowY))
        dropShadowBlur = Math.abs(parseInt(dropShadowBlur))
        const sum = dropShadowX + dropShadowY + dropShadowBlur

        outputCanvas.width = croppedCanvas.width + (sum*2)
        outputCanvas.height = croppedCanvas.height + (sum*2)

        outputCanvas1.width = croppedCanvas.width + (sum*2)
        outputCanvas1.height = croppedCanvas.height + (sum*2)

        const image = document.getElementById('target')
        
        var radius = parseInt(imageBorderRadius);   
        
        //for border radius
        outputContext.beginPath();
        outputContext.moveTo(sum + radius, sum);
        outputContext.lineTo(croppedCanvas.width + sum - radius, sum);
        outputContext.quadraticCurveTo(croppedCanvas.width + sum, sum, croppedCanvas.width + sum, sum + radius);
        outputContext.lineTo(croppedCanvas.width + sum, croppedCanvas.height - radius + sum);
        outputContext.quadraticCurveTo(croppedCanvas.width + sum, croppedCanvas.height + sum, croppedCanvas.width - radius + sum, croppedCanvas.height + sum);
        outputContext.lineTo(sum + radius, sum + croppedCanvas.height);
        outputContext.quadraticCurveTo(sum, sum+croppedCanvas.height, sum, sum + croppedCanvas.height - radius);
        outputContext.lineTo(sum, sum + radius);
        outputContext.quadraticCurveTo(sum, sum, sum + radius, sum);
        outputContext.closePath();
        outputContext.clip();        
        
        outputContext.drawImage(croppedCanvas, sum, sum) 
        
        
        outputContext1.filter = getComputedStyle(image).filter                     
        outputContext1.drawImage(outputCanvas, 0, 0);

        var downloadLink = document.createElement('a')
        downloadLink.href = outputCanvas1.toDataURL()
        downloadLink.download = 'Image.png'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)

        document.getElementById('download-image').classList.remove('loading')
    }

    function resetFilters(){        
        imageFilters["contrast"] = "1"
        imageFilters["saturate"] = "100%"
        imageFilters["brightness"] = "100%"
        imageFilters["blur"] = "0px"
        imageFilters["hue-rotate"] = "0deg"
        imageFilters["drop-shadow"] = "0px 0px 0px black"  

        imageBorderRadius = "0"
        
        document.getElementById('rotate-degree').value = '0°'
        document.getElementById('image-border-radius').value = '0'
        document.getElementById('drop-shadow-x').value = '0'
        document.getElementById('drop-shadow-y').value = '0'
        document.getElementById('drop-shadow-blur').value = '0'     
        
        document.getElementById("brightnessSlider").value = 100
        document.getElementById("contrastSlider").value = 1
        document.getElementById("saturationSlider").value = 100
        document.getElementById("blurSlider").value = 0
        document.getElementById("hueSlider").value = 0
        
    }

})();
