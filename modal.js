var Modal = (function () {
    function Modal(type, options) {
        var defaults = {
            title: "Notification", // modal title
            message: "", // modal message
            autoOpen: true, // show modal when declared
            closeOnEscape: true, // close when escape key pressed
            closeOnBlur: true, // close when overlay is clicked
            animated: true, // animate modal

            // button options
            buttonLbl: "OK", // main button label
            buttonClass: "", // main button class
            cancelLbl: "Cancel", // cancel button label

            // callbacks
            onConfirm: function () {}, // callback on confirm
            onCancel: function () {}, // callback on cancel
            onClose: function () {}, // callback on close
        };

        this.type = type;
        this.options = extend(defaults, options);

        // animations not supported on IE9
        if (navigator.appVersion.indexOf("MSIE 9") !== -1) {
            this.options.animated = false;
        }

        this.init();
    }

    // modal templates
    var templates = {
        modal:
            '<div class="my-14 mx-auto bg-white w-96 p-4 rounded overflow-hidden">' +
            '<div class="relative w-full pb-3 mb-4 border-b border-gray-100">[[title]]<div class="float-right -mt-1 -mr-1 cursor-pointer px-2" data-action="close">&times;</div></div>' +
            '<div class="mb-8">[[message]]</div>' +
            '<div class="flex justify-end -mx-2">[[buttons]]</div>' +
            "</div>",
        btn: '<div class="cursor-pointer px-4 py-2 text-sm text-black hover:bg-red-500 hover:text-white transition-all duration-300 mx-1 rounded" data-action="close">[[label]]</div>',
        btnAlert:
            '<div class="cursor-pointer px-4 py-2 text-sm text-black hover:bg-red-500 hover:text-white transition-all duration-300 mx-1 rounded" data-action="close">[[label]]</div>',
        btnConfirm:
            '<div class="cursor-pointer px-4 py-2 bg-indigo-500 hover:bg-indigo-700 text-sm text-white transition-all duration-300 mx-1 rounded [[classes]]" data-action="confirm">[[label]]</div>',
    };

    // generates the modal html from the templates given the modal's type and options
    function buildModal(type, options) {
        var modal = document.createElement("div");
        modal.className =
            "fixed inset-0 bg-black bg-opacity-25 w-full h-full transition-all text-black duration-300 z-50 text-gray-600";

        if (options.closeOnBlur) modal.setAttribute("data-action", "close");

        var modalTmplt = templates.modal;

        // set modal animations
        if (options.animated) {
            modal.className += " animate-fadeIn";
        }

        modalTmplt = modalTmplt.replace("[[title]]", options.title);
        modalTmplt = modalTmplt.replace("[[message]]", options.message);

        // add buttons based on modal type
        switch (type) {
            case "confirm":
                var buttons = templates.btn.replace(
                    "[[label]]",
                    options.cancelLbl
                );
                buttons += templates.btnConfirm
                    .replace("[[label]]", options.buttonLbl)
                    .replace("[[classes]]", options.buttonClass);
                modalTmplt = modalTmplt.replace("[[buttons]]", buttons);
                break;
            case "alert":
                var buttons = templates.btnAlert.replace(
                    "[[label]]",
                    options.buttonLbl
                );
                modalTmplt = modalTmplt.replace("[[buttons]]", buttons);
                break;
        }

        modal.innerHTML = modalTmplt;
        return modal;
    }

    // handle modal events
    Modal.prototype.handleEvent = function (event) {
        var dataAction = event.target.getAttribute("data-action");

        // animation ended callback
        if (event.type === "animationend") {
            return this.onAnimationEnd(event);
        }

        // check if 'Esc' key was pressed and close modal if set
        if (this.options.closeOnEscape) {
            if (event.keyCode === 27) {
                this.options.onCancel();
                return this.close();
            }
        }

        if (dataAction === "close") {
            this.options.onCancel();
            return this.close();
        }

        if (dataAction === "confirm") {
            this.options.onConfirm();
            return this.close();
        }
    };

    // animation end event handler
    Modal.prototype.onAnimationEnd = function (event) {
        this.modal.removeEventListener("animationend", this);
        document.body.removeChild(this.modal);
        this.options.onClose();
        return this;
    };

    // initialize modal creation
    Modal.prototype.init = function () {
        this.modal = buildModal(this.type, this.options);
        if (this.options.autoOpen) this.open();
    };

    // open modal
    Modal.prototype.open = function () {
        // reset to animate-fadeIn animation on open
        if (this.options.animated) {
            this.modal.className =
                "fixed inset-0 bg-black bg-opacity-25 w-full h-full transition-all text-black duration-300 z-50 text-gray-600 animate-fadeIn";
        }

        // append modal to the body
        document.body.appendChild(this.modal);

        // attach events listeners
        this.modal.addEventListener("click", this);
        document.onkeyup = this.handleEvent.bind(this);

        return this;
    };

    // close modal
    Modal.prototype.close = function () {
        // clean events listeners
        this.modal.removeEventListener("click", this);
        document.onkeyup = null;

        if (this.options.animated) {
            this.modal.addEventListener("animationend", this);
            this.modal.className =
                "fixed inset-0 bg-black bg-opacity-25 w-full h-full transition-all text-black duration-300 z-50 text-gray-600 animate-fadeOut";
        } else {
            document.body.removeChild(this.modal);
            this.options.onClose();
        }

        return this;
    };

    // helper functions
    function extend(obj1, obj2) {
        for (var key in obj2)
            if (obj2.hasOwnProperty(key)) obj1[key] = obj2[key];
        return obj1;
    }

    function isFunction(fn) {
        return typeof fn === "function";
    }

    // modal interfaces
    return {
        confirm: function (options, onConfirm, onCancel, onClose) {
            options =
                typeof options === "string"
                    ? {
                          message: options,
                      }
                    : options;

            if (isFunction(onClose)) options.onClose = onClose;
            if (isFunction(onCancel)) options.onCancel = onCancel;
            if (isFunction(onConfirm)) options.onConfirm = onConfirm;

            return new Modal("confirm", options);
        },
        alert: function (options, onClose) {
            options =
                typeof options === "string"
                    ? {
                          message: options,
                      }
                    : options;

            if (isFunction(onClose)) options.onClose = onClose;

            return new Modal("alert", options);
        },
    };
})();

window.Modal = Modal
