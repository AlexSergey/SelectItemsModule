(function($) {
    function SelectItems(options) {
        this.options = $.extend({
            selectArea       : '.selectArea',
            selectElements   : '.selectElements',
            selectZone       : '',
            ignoreClick      : ['.i-am-ignore', 'button'],
            style            : 'position: fixed; width: 0; height: 0; background: rgba(255, 255, 0, .5); z-index: 1000',
            afterSelect      : function() {},
            ignoreItemClick  : function() {}
        }, options);
        this.init();
    }
    SelectItems.prototype = {
        init: function () {
            this.zone        = $('<div class="' + this.options.selectZone + '" style="' + this.options.style + '" />');
            this.area        = $(this.options.selectArea);
            this.module      = $(this.options.holder);
            this.els         = this.module.find(this.options.selectElements);
            this.selectItems = [];


            this.ignoreEls = [];
            this.options.ignoreClick.forEach(function(item) {
                var el = this.module.find(item);
                if (el.length)
                    this.ignoreEls.push(el);
            }, this);

            this.on();
        },

        down: function(e) {
            if (!e.ctrlKey) {
                this.selectItems = [];
            }
            this.flag = true;
            this.clientX = e.clientX;
            this.clientY = e.clientY;
            this.zone.css({
                'left': this.clientX,
                'top': this.clientY,
                'right': 'auto',
                'bottom': 'auto',
                width: 0,
                height: 0
            });
            this.area.append(this.zone);
        },

        move: function(e) {
            var newClientX = e.clientX - this.clientX,
                newClientY = e.clientY - this.clientY,
                winH       = $(window).height(),
                winW       = $(window).width();

            if (this.clientX < e.clientX &&
                this.clientY > e.clientY) {
                console.log('right top');

                this.zone.css({
                    'left'   : this.clientX,
                    'bottom' : winH - this.clientY,
                    'right'  : 'auto',
                    'top'    : 'auto'
                });

                this.zone.css({
                    'width'  : newClientX,
                    'height' : newClientY * -1
                });

                return false;

            } else if (this.clientX > e.clientX &&
                this.clientY < e.clientY) {
                console.log('left bottom');

                this.zone.css({
                    'right'  : winW - this.clientX,
                    'top'    : this.clientY,
                    'left'   : 'auto',
                    'bottom' : 'auto'
                });

                this.zone.css({
                    'width'  : newClientX * -1,
                    'height' : newClientY
                });

                return false;

            } else if (this.clientX > e.clientX &&
                this.clientY > e.clientY) {
                console.log('left top');

                this.zone.css({
                    'right': winW - this.clientX,
                    'bottom': winH - this.clientY,
                    'left': 'auto',
                    'top': 'auto'
                });

                this.zone.css({
                    'width'  : newClientX * -1,
                    'height' : newClientY * -1
                });

                return false;

            } else if (this.clientX < e.clientX &&
                this.clientY < e.clientY) {
                console.log('right bottom');

                this.zone.css({
                    'left'   : this.clientX,
                    'top'    : this.clientY,
                    'bottom' : 'auto',
                    'right'  : 'auto'
                });

                this.zone.css({
                    'width'  : newClientX,
                    'height' : newClientY
                });

                return false;
            }
        },

        up: function(e) {
            this.clientX = e.clientX;
            this.clientY = e.clientY;
            var target = $(e.target);

            for (var i = 0, length = this.ignoreEls.length; i < length; i++) {
                if (target[0] === this.ignoreEls[i].get()[0]) {
                    this.options.ignoreItemClick.call(this.area, this.selectItems);
                    this.flag = false;
                    this.zone.remove();
                    return false;
                }
            }

            this.els.each(function(index, item) {
                var el     = $(item),
                    select = el.attr('data-selection') == 'true' ? true : false;

                if (select) {
                    var elTop    = el.offset().top,
                        elLeft   = el.offset().left,
                        zTop     = this.zone.offset().top,
                        elHeight = el.outerHeight(),
                        elWidth  = el.outerWidth(),
                        zHeight  = this.zone.outerHeight(),
                        zWidth   = this.zone.outerWidth(),
                        zLeft    = this.zone.offset().left;

                    if ((elTop + elHeight) > zTop             &&
                        elTop             < (zTop + zHeight) &&
                        (elLeft + elWidth) >  zLeft           &&
                        elLeft            < (zLeft + zWidth)
                    ) {
                        if (this.selectItems.length > 0) {
                            if (!el.hasClass('active')) {
                                el.addClass('active');
                                this.selectItems.push(el);
                            } else {
                                if (e.ctrlKey && zHeight == 0 && zWidth == 0) {
                                    el.removeClass('active');
                                    this.selectItems.forEach(function(elm, ind) {
                                        if (elm[0] === el[0]) {
                                            this.selectItems.splice(ind, 1);
                                        }
                                    }.bind(this));
                                }
                            }
                        } else {
                            el.addClass('active');
                            this.selectItems.push(el);
                        }
                    } else {
                        if (!e.ctrlKey) {
                            el.removeClass('active');
                        }
                    }
                }
            }.bind(this));

            this.options.afterSelect.call(this.area, this.selectItems);
            this.flag = false;
            this.zone.remove();
        },

        disableSelect: function(e) {
            var from = e.relatedTarget || e.toElement;
            if (!from || from.nodeName == "HTML") {
                this.zone.remove();
            }
        },

        on: function() {
            this.area.addClass('disable-select');

            this.area.on('mousedown', $.proxy(this.down, this));
            this.area.on('mousemove', $.proxy(this.move, this));
            this.area.on('mouseup',   $.proxy(this.up, this));
            $(window).on('mouseout',  $.proxy(this.disableSelect, this));
        },

        off: function() {
            this.area.removeClass('disable-select');

            this.area.off('mousedown', $.proxy(this.down, this));
            this.area.off('mousemove', $.proxy(this.move, this));
            this.area.off('mouseup',   $.proxy(this.up, this));
            $(window).off('mouseout',  $.proxy(this.disableSelect, this));
        }
    };

    $.fn.selectItems = function(opt) {
        return this.each(function () {
            $(this).data('SelectItems', new SelectItems($.extend(opt,{holder:this})));
        });
    };
})(jQuery);