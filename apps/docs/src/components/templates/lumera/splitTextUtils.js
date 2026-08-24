/* eslint-disable no-inner-declarations */
// src/utils/splitText.js

import SplitType from 'split-type';


export function SplitInLineOnly(element) {
  if (!element) return null;
  return new SplitType(element, {
    types: 'lines',
  });
}

export function SplitInLine(element) {
   if (!element) return null;
 
   // Break the text into lines
   const splitInstance = new SplitType(element, {
     types: 'lines',
   });
 
   // Add an additional div inside each line with the class name 'line-internal'
   splitInstance.lines.forEach(line => {
     const internalDiv = document.createElement('div');
     internalDiv.className = 'line-internal';
     internalDiv.innerHTML = line.innerHTML;
     line.innerHTML = '';
     line.appendChild(internalDiv);
   });
 
   return splitInstance;
 }

export function SplitInLineWordChar(element) {
    if (!element) return null;
    return new SplitType(element, {
      types: 'lines, words, chars',
    });
  }

export function SplitInLineWord(element) {
    if (!element) return null;
    return new SplitType(element, {
      types: 'lines, words',
    });
}

export function SplitInChar(element) {
  if (!element) return null;
  return new SplitType(element, {
    types: 'chars',
  });
}

export function SplitInWordChar(element) {
  if (!element) return null;
  return new SplitType(element, {
    types: 'words, chars',
  });
}

// export function initMagneticButton() {
//     var magnets = document.querySelectorAll('[data-magnetic-target]');
    
//     if(window.innerWidth > 1024){
       
//        magnets.forEach((magnet) => {
//           magnet.addEventListener('mousemove', moveMagnet );
//           magnet.addEventListener('mouseleave', function(event) {
//              gsap.to( $(event.currentTarget).find('.magnetic-inner'), 1.4, {
//                 x: 0, 
//                 y: 0, 
//                 ease: Expo.easeOut
//              });    
//           });
//        });
 
//        function moveMagnet(event) {
//           var magnetButton = event.currentTarget;
//           var bounding = magnetButton.getBoundingClientRect();
//           var magnetsStrength = magnetButton.getAttribute("data-magnetic-strength");
          
//           if($(event.currentTarget).parent().hasClass('hover')) {
//              gsap.to($(magnetButton).find('.magnetic-inner'), 1, {
//                 x: ((( event.clientX - bounding.left)/magnetButton.offsetWidth) - 0.5) * magnetsStrength,
//                 y: ((( event.clientY - bounding.top)/magnetButton.offsetHeight) - 0.5) * magnetsStrength,
//                 rotate: "0.001deg",
//                 ease: Expo.easeOut
//              });
//           } else {
//              gsap.to($(magnetButton).find('.magnetic-inner'), 1.4, {
//                 x: (event.clientX - bounding.left) - (bounding.width / 2),
//                 y: (event.clientY - bounding.top) - (bounding.height / 2),
//                 rotate: "0.001deg",
//                 ease: Expo.easeOut
//              }); 
//           }
 
//        }
//     }
//  }