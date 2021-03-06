/**
 * Stylings for Datatables
 */

(function(global, factory) {
  // Common JS (i.e. browserify) environment
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
    factory(require('minnpost-styles'), require('underscore'), require('jquery'), require('datatables'));
  }
  // AMD?
  else if (typeof define === 'function' && define.amd) {
    define('minnpost-styles.datatables', ['minnpost-styles', 'underscore', 'jquery', 'datatables'], factory);
  }
  // Browser global
  else if (global.MP && global._ && global.jQuery.fn.dataTable) {
    factory(global.MP, global._, global.jQuery);
  }
  else {
    throw new Error('Could not find dependencies for MinnPost Styles Datatables.' );
  }
})(typeof window !== 'undefined' ? window : this, function(MP, _, $) {

  // Placeholder for datatables stuff
  MP.datatables = MP.datatables || {};

  // Basic datatable creator wrapper
  MP.datatables.makeTable = function($container, options) {
    var $table = $container.find('table');
    options = $.extend(true, {}, options, MP.datatables.defaultOptions);
    $table.dataTable(options);
    return $table;
  };

  // Default options
  MP.datatables.defaultOptions = {
    iDisplayLength: 10,
    bLengthChange: false,
    bProcessing: false,
    bAutoWidth: true,
    aaSorting: [[ 0, 'asc' ]],
    aLengthMenu: [[10, 20, 50, -1], [10, 20, 50, 'All']],
    oLanguage: {
      sSearch: '',
      oPaginate: {
        sNext: '<i class="fa fa-arrow-circle-right"></i> <span class="icon-text">Next</span>',
        sPrevious: '<i class="fa fa-arrow-circle-left"></i> <span class="icon-text">Previous</span>'
      }
    },
    // https://datatables.net/usage/options#sDom
    sDom: '<"row datatables-top" <"column-small-50" l > <"column-small-50" f > >  < r > <"table-responsive-medium" t > <"row datatables-bottom" <"column-small-50" i > <"column-small-50" p > >',
    // A hackish way to get a placeholder
    fnDrawCallback: function() {
      $(this).parent().parent().find('.dataTables_filter input').attr('placeholder', 'Search table');
    }
  };

  // Clear all filtering.
  // See: http://datatables.net/plug-ins/api#fnFilterClear
  $.fn.dataTableExt.oApi.fnFilterClear = function(oSettings) {
    var n;
    var i;
    /* Remove global filter */
    oSettings.oPreviousSearch.sSearch = "";

    /* Remove the text of the global filter in the input boxes */
    if (typeof oSettings.aanFeatures.f != 'undefined') {
      n = oSettings.aanFeatures.f;

      for (i=0, iLen=n.length ; i<iLen ; i++ ) {
        $('input', n[i]).val( '' );
      }
    }

    /* Remove the search text for the column filters
     * NOTE - if you have input boxes for these
     * filters, these will need to be reset
     */
    for (i=0, iLen=oSettings.aoPreSearchCols.length ; i<iLen ; i++) {
      oSettings.aoPreSearchCols[i].sSearch = "";
    }

    /* Redraw */
    oSettings.oApi._fnReDraw(oSettings);
  };

  // Type deteection for formatted numbers.
  // From: http://datatables.net/plug-ins/type-detection
  $.fn.dataTableExt.aTypes.unshift(function(sData) {
    var deformatted = sData.replace(/[^\d\-\.\/a-zA-Z]/g,'');
    if ( $.isNumeric( deformatted ) || deformatted === "-" ) {
      return 'formatted-num';
    }
    return null;
  });

  // Sorting for numbers so that characters do not interfere
  $.fn.dataTableExt.oSort['formatted-num-asc'] = function(a,b) {
    /* Remove any formatting */
    var x = a.match(/\d/) ? a.replace( /[^\d\-\.]/g, "" ) : 0;
    var y = b.match(/\d/) ? b.replace( /[^\d\-\.]/g, "" ) : 0;
    return parseFloat(x) - parseFloat(y);
  };
  $.fn.dataTableExt.oSort['formatted-num-desc'] = function(a,b) {
    var x = a.match(/\d/) ? a.replace( /[^\d\-\.]/g, "" ) : 0;
    var y = b.match(/\d/) ? b.replace( /[^\d\-\.]/g, "" ) : 0;
    return parseFloat(y) - parseFloat(x);
  };

  // Make filter links.  Given a jQuery object find links that
  // have the class .datatables-filter-links.
  // Use: data-col attribute to choose column
  // Use: data-text for the text to filter with
  MP.datatables.listenFilterLinks = function($datatable, $container, activeClass) {
    activeClass = activeClass || 'active';

    $container.on('click.mp.filterLinks', '.datatables-filter-link', function(e) {
      e.preventDefault();
      var $thisLink = $(this);

      if ($thisLink.hasClass('filter-clear')) {
        $dataTable.fnFilterClear();
      }
      else {
        $dataTable.fnFilter($thisLink.data('text'), $thisLink.data('col'));
      }

      $container.find('.datatables-filter-link').removeClass(activeClass);
      $thisLink.addClass(activeClass);
    });
  };

});


/**
 * Formatters
 */

(function(global, factory) {
  // Common JS (i.e. browserify) environment
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
    factory(require('minnpost-styles'), require('underscore'));
  }
  // AMD?
  else if (typeof define === 'function' && define.amd) {
    define('minnpost-styles.formatters', ['minnpost-styles', 'underscore'], factory);
  }
  // Browser global
  else if (global.MP && global._) {
    factory(global.MP, global._);
  }
  else {
    throw new Error('Could not find dependencies for MinnPost Styles Formatters.' );
  }
})(typeof window !== 'undefined' ? window : this, function(MP, _) {

  // Placeholder for formatters stuff
  MP.formatters = MP.formatters || {};

  // Format number
  MP.formatters.number = function(num, decimals) {
    decimals = (decimals || decimals === 0) ? decimals : 2;
    var rgx = (/(\d+)(\d{3})/);
    split = num.toFixed(decimals).toString().split('.');

    while (rgx.test(split[0])) {
      split[0] = split[0].replace(rgx, '$1' + ',' + '$2');
    }
    return (decimals) ? split[0] + '.' + split[1] : split[0];
  };

  // Format integer
  MP.formatters.integer = function(num, round) {
    round = round || true;
    num = (round) ? Math.round(num) : num;
    return MP.formatters.number(num, 0);
  };

  // Basic US currency
  MP.formatters.currency = function(num) {
    return '$' + MP.formatters.number(num, 2);
  };

  // Percentage
  MP.formatters.percent = function(num, decimals) {
    decimals = (decimals || decimals === 0) ? decimals : 1;
    return MP.formatters.number(num * 100, decimals) + '%';
  };

  // Percent change
  MP.formatters.percentChange = function(num, decimals) {
    return ((num > 0) ? '+' : '') + MP.formatters.percent(num, decimals);
  };

  // Number change
  MP.formatters.change = function(num, decimals) {
    decimals = (decimals || decimals === 0) ? decimals : 2;
    return ((num > 0) ? '+' : '') + MP.formatters.number(num);
  };

  // Converts string into a hash (very basically).
  MP.formatters.hash = function(str) {
    return Math.abs(_.reduce(str.split(''), function(a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
  };

  // Identifier/slug maker
  MP.formatters.identifier = function(str) {
    return str.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-').replace(/[^\w-]+/g,'');
  };

});


/**
 * Stylings for Highcharts
 */

(function(global, factory) {
  // Common JS (i.e. browserify) environment
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
    factory(require('minnpost-styles'), require('jquery'), require('Highcharts'));
  }
  // AMD?
  else if (typeof define === 'function' && define.amd) {
    define('minnpost-styles.highcharts', ['minnpost-styles', 'jquery', 'Highcharts'], factory);
  }
  // Browser global
  else if (global.MP && global.jQuery && global.Highcharts) {
    factory(global.MP, global.jQuery, global.Highcharts);
  }
  else {
    throw new Error('Could not find dependencies for MinnPost Styles Highchart.' );
  }
})(typeof window !== 'undefined' ? window : this, function(MP, $, Highcharts) {

  // Placeholder for highcharts stuff
  MP.highcharts = MP.highcharts || {};

  // A wrapper to make highchart with selector and
  // return the highcharts object
  MP.highcharts.makeChart = function(selector, options) {
    var chart = $(selector).highcharts(options);
    return chart.highcharts();
  };

  // Common colors
  MP.highcharts.colors = {};
  MP.highcharts.colors.interface = '#BCBCBC';

  // Common defauls
  MP.highcharts.defaults = {
    chart: {
      style: {
        fontFamily: '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
        color: MP.highcharts.colors.interface
      }
    },
    colors: ['#094C86', '#0D6CBF', '#098643', '#4C8609'],
    credits: {
      enabled: false
    },
    title: {
      enabled: false,
      text: null
    },
    legend: {
      margin: 20,
      borderWidth: 0,
      itemDistance: 6,
      style: {
        color: 'inherit'
      },
      itemStyle: {
        color: 'inherit'
      }
    },
    xAxis: {
      title: {
        enabled: false,
        text: 'Units (un)',
        margin: 15,
        style: {
          color: 'inherit',
          fontWeight: 'normal'
        }
      },
      lineColor: MP.highcharts.colors.interface,
      tickColor: MP.highcharts.colors.interface,
      labels: {
        y: 18,
        //format: '${value}'
        formatter: function() {
          return this.value;
        }
      }
    },
    yAxis: {
      title: {
        enabled: true,
        text: 'Units (un)',
        margin: 15,
        style: {
          color: 'inherit',
          fontWeight: 'normal'
        }
      },
      min: 0,
      lineColor: MP.highcharts.colors.interface,
      gridLineDashStyle: 'ShortDash'
    },
    tooltip: {
      //shadow: false,
      //borderRadius: 0,
      //borderWidth: 0,
      style: {},
      useHTML: true,
      formatter: function() {
        return '<strong>' + this.series.name + '</strong>: ' + this.y;
      }
    }
  };

  // Line charts defaults
  MP.highcharts.lineOptions = $.extend(true, {}, MP.highcharts.defaults, {
    chart: {
      type: 'line'
    },
    plotOptions: {
      line: {
        lineWidth: 4,
        states: {
          hover: {
            lineWidth: 5
          }
        },
        marker: {
          fillColor: '#FFFFFF',
          lineWidth: 2,
          lineColor: null,
          symbol: 'circle',
          enabled: false,
          states: {
            hover: {
              enabled: true
            }
          }
        }
      }
    }
  });

  // Column charts defaults
  MP.highcharts.columnOptions = $.extend(true, {}, MP.highcharts.defaults, {
    chart: {
      type: 'column'
    },
    plotOptions: {
      column: {
        minPointLength: 3
      }
    }
  });

  // Bar charts defaults
  MP.highcharts.barOptions = $.extend(true, {}, MP.highcharts.defaults, {
    chart: {
      type: 'bar'
    },
    plotOptions: {
      bar: {
        minPointLength: 3
      }
    },
    xAxis: {
      labels: {
        y: 0
      }
    }
  });

  // Scatter plot
  MP.highcharts.scatterOptions = $.extend(true, {}, MP.highcharts.defaults, {
    chart: {
      type: 'scatter'
    },
    xAxis: {
      title: {
        enabled: true
      }
    },
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          lineWidth: 2,
          lineColor: 'rgba(255, 255, 255, 0.2)',
          hover: {
            lineColor: 'rgba(255, 255, 255, 1)'
          }
        }
      }
    },
    tooltip: {
      formatter: function() {
        return '<strong>' + this.series.name + '</strong>: (' + this.x + ', ' + this.y + ')';
      }
    }
  });

});


/**
 * The main MinnPost Styles JS.
 */

(function (global) {

  // MP is simply a container for other things
  var MP = {};


  // Export as Common JS module, AMD module, or as global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MP;
  }
  else if (typeof define === 'function' && define.amd) {
    define('minnpost-styles', function() {
      return MP;
    });
  }
  else {
    global.MP = MP;
  }
})(typeof window !== 'undefined' ? window : this);


/**
 * Stylings and interactions for maps
 */

(function(global, factory) {
  // Common JS (i.e. browserify) environment
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
    factory(require('minnpost-styles'), require('Leaflet'));
  }
  // AMD?
  else if (typeof define === 'function' && define.amd) {
    define('minnpost-styles.maps', ['minnpost-styles', 'Leaflet'], factory);
  }
  // Browser global
  else if (global.MP && global.Leaflet) {
    factory(global.MP, global.Leaflet);
  }
  else {
    throw new Error('Could not find dependencies for MinnPost Styles Maps.' );
  }
})(typeof window !== 'undefined' ? window : this, function(MP, L) {

  // Placeholder for maps stuff
  MP.maps = MP.maps || {};

  // Some general helpful values
  MP.maps.minneapolisPoint = L.latLng(44.983333998267824, -93.26667000248563);
  MP.maps.stPaulPoint = L.latLng(44.95370289870105, -93.08995780069381);
  MP.maps.minnesotaPoint = L.latLng(46.518286790004616, -94.55406386114191);
  MP.maps.mapboxSatelliteStreets = 'minnpost.map-95lgm5jf';
  MP.maps.mapboxStreetsDarkLabels = 'minnpost.map-4v6echxm';
  MP.maps.mapboxStreetsLightLabels = 'minnpost.map-wi88b700';
  MP.maps.mapboxTerrainLight = 'minnpost.map-vhjzpwel';
  MP.maps.mapboxTerrainDark = 'minnpost.map-dhba3e3l';
  MP.maps.mapOptions = {
    scrollWheelZoom: false,
    trackResize: true
  };
  MP.maps.mapStyle = {
    stroke: true,
    color: '#2DA51D',
    weight: 1.5,
    opacity: 0.9,
    fill: true,
    fillColor: '#2DA51D',
    fillOpacity: 0.2
  };
  MP.maps.mapboxAttribution = 'Some map imagery provided by <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>.';
  MP.maps.openstreetmapAttribution = 'Some map data provided by &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.';

  // Make basic Leaflet map.  Takes id of container and mapbox ID
  // in the MP.maps object
  MP.maps.makeLeafletMap = function(id, baseName, center) {
    baseName = baseName || MP.maps.mapboxStreetsLightLabels;
    center = center || MP.maps.minneapolisPoint;

    var map = new L.Map(id, MP.maps.mapOptions);
    var base = new L.tileLayer('//{s}.tiles.mapbox.com/v3/' + baseName + '/{z}/{x}/{y}.png');
    map.addLayer(base);
    map.setView(center, 8);

    // This removes the embedded attribution which should be in the footnote
    // but ensure that attribution is given correctly
    map.removeControl(map.attributionControl);

    return map;
  };

  // Make a Maki icon.  Icon should refer to maki icon short name,
  // size should be s, m, or l and color should be hex without the #.
  //
  // See list of icons: https://www.mapbox.com/maki/
  // Leave icon blank for blank pin
  MP.maps.makeMakiIcon = function(icon, size, color) {
    icon = icon || null;
    color = color || '094C86';
    size = size || 'm';

    var url = 'https://api.tiles.mapbox.com/v3/marker/';
    var iconSizes = {
      's': { iconSize: [20, 50], popupAnchor: [0, -20] },
      'm': { iconSize: [30, 70], popupAnchor: [0, -30] },
      'l': { iconSize: [36,90], popupAnchor: [0, -40] }
    };
    url = url + 'pin-' + size + ((icon === null) ? '' : '-' + icon) + '+' + color + '.png';

    return new L.Icon(L.extend(iconSizes[size], {
      iconUrl: url,
      shadowAnchor: null,
      shadowSize: null,
      shadowUrl: null,
      className: 'maki-marker'
    }));
  };

  // Basic control for a staticly places tooltip
  MP.maps.TooltipControl = L.Control.extend({
    options: {
      position: 'topright'
    },

    initialize: function() {
    },

    update: function(content) {
      this._contentWrapper.innerHTML = content;
      this.show();
    },

    show: function() {
      this._container.style.display = 'block';
    },

    hide: function() {
      this._container.style.display = 'none';
    },

    onAdd: function(map) {
      this._container = L.DomUtil.create('div', 'map-tooltip');
      this._contentWrapper = L.DomUtil.create('div', 'map-tooltip-content');
      this._container.appendChild(this._contentWrapper);
      this.hide();
      return this._container;
    },

    onRemove: function(map) {
    }
  });

});


/**
 * Navigation interaction
 */

(function(global, factory) {
  // Common JS (i.e. browserify) environment
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
    factory(require('minnpost-styles'), require('jquery'), require('underscore'));
  }
  // AMD?
  else if (typeof define === 'function' && define.amd) {
    define('minnpost-styles.nav', ['minnpost-styles', 'jquery', 'underscore'], factory);
  }
  // Browser global
  else if (global.MP && global.jQuery && global._) {
    factory(global.MP, global.jQuery, global._);
  }
  else {
    throw new Error('Could not find dependencies for MinnPost Styles Maps.' );
  }
})(typeof window !== 'undefined' ? window : this, function(MP, $, _) {

  // Wrapper object for some various things
  MP.nav = MP.nav || {};

  // Plugin for sticking things.  Defaults are for sticking to top.
  MP.nav.MPStickDefaults = {
    activeClass: 'stuck top',
    wrapperClass: 'minnpost-full-container',
    topPadding: 0,
    throttle: 90
  };
  function MPStick(element, options) {
    // Defined some values and process options
    this.element = element;
    this.$element = $(element);
    this._defaults = MP.nav.MPStickDefaults;
    this.options = $.extend( {}, this._defaults, options);
    this._name = 'mpStick';
    this._scrollEvent = 'scroll.mp.mpStick';
    this._on = false;

    this.init();
  }
  MPStick.prototype = {
    init: function() {
      // If contaier not passed, use parent
      this.$container = (this.options.container === undefined) ? this.$element.parent() : $(this.options.container);

      this.elementHeight = this.$element.outerHeight(true);

      // Create a spacer element so content doesn't jump
      this.$spacer = $('<div>').height(this.elementHeight).hide();
      this.$element.after(this.$spacer);

      // Add wrapper
      if (this.options.wrapperClass) {
        this.$element.wrapInner('<div class="' + this.options.wrapperClass + '"></div>');
      }

      // Throttle the scoll listen for better perfomance
      this._throttledListen = _.bind(_.throttle(this.listen, this.options.throttle), this);
      this._throttledListen();
      $(window).on(this._scrollEvent, this._throttledListen);
    },

    listen: function() {
      var containerTop = this.$container.offset().top;
      var containerBottom = containerTop + this.$container.height();
      var scrollTop = $(window).scrollTop();
      var top = (containerTop - this.options.topPadding);
      var bottom = (containerBottom - this.elementHeight - this.options.topPadding - 2);

      // Test whether we are in the container and whether its
      // already stuck or not
      if (!this._on && scrollTop > top && scrollTop < bottom) {
        this.on();
      }
      else if (this._on && (scrollTop < top || scrollTop > bottom)) {
        this.off();
      }
    },

    on: function() {
      this.$element.addClass(this.options.activeClass);
      if (this.options.topPadding) {
        this.$element.css('top', this.options.topPadding);
      }
      this.$spacer.show();
      this._on = true;
    },

    off: function() {
      this.$element.removeClass(this.options.activeClass);
      if (this.options.topPadding) {
        this.$element.css('top', 'inherit');
      }
      this.$spacer.hide();
      this._on = false;
    },

    remove: function() {
      this.$container.off(this._scrollEvent);
    }
  };
  // Register plugin
  $.fn.mpStick = function(options) {
    return this.each(function() {
      if (!$.data(this, 'mpStick')) {
        $.data(this, 'mpStick', new MPStick(this, options));
      }
    });
  };



  // Plugin for scroll spying
  MP.nav.MPScrollSpyDefaults = {
    activeClass: 'active',
    offset: 80,
    throttle: 200
  };
  function MPScrollSpy(element, options) {
    // Set some initial values and options
    this.element = element;
    this.$element = $(element);
    this._defaults = MP.nav.MPScrollSpyDefaults;
    this.options = $.extend( {}, this._defaults, options);
    this._name = 'mpScollSpy';
    this._scrollEvent = 'scroll.mp.mpScollSpy';

    this.init();
  }
  MPScrollSpy.prototype = {
    init: function() {
      // Get listeners and targets
      this.$listeners = this.$element.find('[data-spy-on]');
      this.$targets = this.$element.find('[data-spy-me]');

      // Throttle the scoll listen for better perfomance
      this._throttledListen = _.bind(_.throttle(this.listen, this.options.throttle), this);
      this._throttledListen();
      $(window).on(this._scrollEvent, this._throttledListen);

      // Handle click
      this.$listeners.on('click', _.bind(this.gotoClick, this));
    },

    listen: function() {
      var thisPlugin = this;
      var scrollTop = $(window).scrollTop();
      var target;

      // Find target that is closest to scroll top
      this.$targets.each(function() {
        var $target = $(this);
        if ($target.offset().top <= (scrollTop + (thisPlugin.options.offset + 5))) {
          target = $target.data('spyMe');
        }
      });

      // Once found one, then mark the listener
      if (target) {
        this.$listeners.removeClass(this.options.activeClass);
        this.$element.find('[data-spy-on="' + target + '"]').addClass(this.options.activeClass);
      }
    },

    gotoClick: function(e) {
      e.preventDefault();
      var $listener = $(e.target);

      this.goto($(e.target).data('spyOn'));
    },

    goto: function(target) {
      var $target = this.$element.find('[data-spy-me="' + target + '"]');
      var top = $target.offset().top;

      $('html, body').animate({
        scrollTop: (top - this.options.offset)
      }, 600);
    },

    remove: function() {
      this.$container.off(this._scrollEvent);
    }
  };
  // Register plugin
  $.fn.mpScrollSpy = function(options) {
    return this.each(function() {
      if (!$.data(this, 'mpScrollSpy')) {
        $.data(this, 'mpScrollSpy', new MPScrollSpy(this, options));
      }
    });
  };


});
