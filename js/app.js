/**
 * JS specific to demo page.
 */

require.config({
  shim: {
    'underscore': {
      exports: '_'
    },
    'tabletop': {
      exports: 'Tabletop'
    }
  },
  paths: {
    'text': 'bower_components/text/text',
    'underscore': 'bower_components/underscore/underscore-min',
    'jquery': 'bower_components/jquery/jquery.min',
    'moment': 'bower_components/momentjs/min/moment.min',
    'tabletop': 'bower_components/tabletop/src/tabletop',
    'Ractive': 'bower_components/ractive/build/Ractive.min',
    'Ractive-events-tap': 'bower_components/ractive-events-tap/Ractive-events-tap.min',
    'minnpost-styles': 'bower_components/minnpost-styles/dist/minnpost-styles.all.min',
    'minnpost-styles.nav': 'bower_components/minnpost-styles/dist/minnpost-styles.all.min',
    'minnpost-styles.formatters': 'bower_components/minnpost-styles/dist/minnpost-styles.all.min'
  }
});

require(['underscore', 'jquery', 'moment', 'tabletop', 'Ractive', 'Ractive-events-tap', 'text!js/template.ractive', 'minnpost-styles', 'minnpost-styles.nav', 'minnpost-styles.formatters'], function(_, $, moment, Tabletop, Ractive, RET, appTemplate, MP) {

  // Once data is ready
  function dataReady(data) {

    var ractive = new Ractive({
      el: '.app-container',
      template: appTemplate,
      data: {
        orgs: data,
        formatters: MP.formatters
      }
    });
  };

  // Parse some data
  function parseData(data) {
    // Filter out bad entries
    data = _.filter(data, function(row, ri) {
      return (!!row.jobtitle);
    });

    // Fromat some things
    data = _.map(data, function(row, ri) {
      row.dateentered = (row.dateentered) ? moment(row.dateentered) : moment('invalid date');
      row.timestamp = row.dateentered.isValid() ? row.dateentered.unix() : -1;
      return row;
    });

    // Sort by date entered
    data = _.sortBy(data, function(row, ri) {
      return (row.timestamp * -1);
    });

    // Group by org
    data = _.map(_.groupBy(data, 'organization'), function(listings, org) {
      return {
        id: MP.formatters.identifier(org),
        name: org,
        listings: listings
      }
    });

    dataReady(data);
  };

  // Get data and the such
  $(document).ready(function() {
    Tabletop.init({
      key: '0AmqohgGX3YQadE1VSktrWG1nNFF6RUFNT1RKa0k0a2c',
      wanted: ['Listings'],
      parameterize: 'http://gs-proxy.herokuapp.com/proxy?url=',
      callback: function(data, tabletop) {
        parseData(data.Listings.elements);
      }
    })
  });
});
