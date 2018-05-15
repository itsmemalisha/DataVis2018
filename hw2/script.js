var format = {
  'string': function(t) { return t;},
  'float': d3.format('.1f'),
  'gdp' : d3.format('.2s'),
  'int': d3.format(",.2r")
};

var neededColumns = [
  {
    title: 'name',
    format: format['string']
  },
  {
    title: 'continent',
    format: format['string']
  },
  {
    title: 'gdp',
    format: format['gdp']
  },
  {
    title: 'life_expectancy',
    format: format['float']
  },
  {
    title: 'population',
    format: format['int']
  },
  {
    title: 'year',
    format: format['string']
  }
];

var sortedTitle = '';
var sortedAscending = true;

var filterTitles = [
  'Americas', 'Africa', 'Asia', 'Europe', 'Oceania'
];
var continentFilter = [];

var timelineData = [1995, 2012];

var filtredData = [];

var isAgregated = false;

var isTimedata = false;

var Index;

var years = ['1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012']

//  Get json data
d3.json('https://itsmemalisha.github.io/hw2/countries_2012.json', function(error, jsonData) {
  // Create timeline
d3.json('https://itsmemalisha.github.io/hw2/countries_1995_2012.json', function(error, timeData) { 
  var timeline = d3.select('body').append('div')
    .attr('class', 'controller-row').text('Time update:');
  timeline.append('span').text(timelineData[0]);
  timeline.append('input').attr('type', 'range')
    .attr('name', 'points')
    .attr('min', timelineData[0]).attr('max', timelineData[1])
    .attr('step', '1').attr('value', '0')
    .on('change', function(value) {
    	isTimedata = true;
    	if (years.includes(this.value)) {
    		Index = years.indexOf(this.value)
    		NewtimeData(Index);
    	}
    });


  timeline.append('span').text(timelineData[1]);
  

  // Create filter controller row
  var filterController = d3.select('body').append('div')
    .attr('class', 'controller-row')
    .text('Filter by:').selectAll('span')
    .data(filterTitles).enter().append("span");

  filterController.append('input').attr('type', 'checkbox')
    .attr('id', function(d) { return 'checkbox-' + d.toLowerCase(); })
    .attr('name', function(d) { return d; })
    .attr('value', function(d) { return d; })
    .on('change', function(value) {
      // Set filter values
      if (this. checked) {
        continentFilter.push(value);
      } else {
        var index = continentFilter.indexOf(value);
        if (index !== -1) {
          continentFilter.splice(index, 1);
        }
      }
      ContinentData(continentFilter);
  });
    function ContinentData(continentFilter){
      // Apply filter to data
      tbody.selectAll('tr').remove();
      if (continentFilter.length == 0 || continentFilter.length == 5) {
        if (isTimedata) {filtredData = NewYearsData}
        else {filtredData = jsonData}
        if (isAgregated) {
          AggregateData();
          return;
        }
        createRowsWithData(filtredData);
      } else {
      	if (isTimedata) {Data = NewYearsData}
        else {Data = jsonData}
        filtredData = [];
        Data.forEach(function(item) {
          if (continentFilter.includes(item.continent)) {
            filtredData.push(item);
          }
        });
        if (isAgregated) {
          AggregateData();
          return;
        }
            createRowsWithData(filtredData);
      }
      sortRowsByTitle(sortedTitle, sortedAscending);
	}

  filterController.append("label")
    .attr('for', function(d) { return 'checkbox-' + d.toLowerCase(); })
    .text(function(d) { return d; });

  // Create aggregation row
  var aggregation = d3.select('body').append('div')
    .attr('class', 'controller-row')
    .text('Aggregation:').selectAll('span')
    .data(['None', 'by Continent']).enter().append("span");

  aggregation.append('input').attr('type', 'radio')
    .attr('id', function(d) { return 'radio-' + d.toLowerCase(); })
    .attr('name', 'aggregation')
    .attr('value', function(d) { return d; })
    .property('checked', function(d, i) { return i == 0; })
    .on('click', function(value) {
      //  Apply aggregation to data
      if (value == 'None') {
        isAgregated = false;
        tbody.selectAll('tr.row').remove();
        if (isTimedata) {filtredData = NewYearsData}
        else {filtredData = jsonData}
        ContinentData(continentFilter);
        sortRowsByTitle(sortedTitle, sortedAscending);
        return;
      }
      else {
      	isAgregated = true;
      AggregateData();
      }
      
    });

   function NewtimeData(Index) {
   	
   	NewYearsData  = []
   	for (var i = 0; i < timeData.length; i++) {
   	NewYearsData.push({
   		name: timeData[i].name,
   		continent: timeData[i].continent,
   		gdp: timeData[i].years[Index].gdp,
   		life_expectancy:timeData[i].years[Index].life_expectancy,
   		population:timeData[i].years[Index].population,
   		year: timeData[i].years[Index].year
   	})
   }
   	tbody.selectAll('tr').remove()
   	ContinentData(continentFilter);
   	sortRowsByTitle(sortedTitle, sortedAscending)
   }

  function AggregateData() {
  	if (isTimedata) {filtredData = NewYearsData}
    else {filtredData = jsonData}
    var aggrData = d3.nest()
    .key(function(d) { return d.continent;})
    .rollup(function(leaves) {
      return {
        name: leaves[0].continent,
        continent: leaves[0].continent,
        gdp: d3.sum(leaves.map(function(item) {
          return item.gdp;
        })),
        life_expectancy: d3.mean(leaves.map(function(item) {
          return item.life_expectancy;
        })),
        population: d3.sum(leaves.map(function(item) {
          return item.population;
        })),
        year: leaves[0].year
      };
    }).entries(filtredData);
    tbody.selectAll('tr').remove();
    aggrData = aggrData.map(function(item) {
      return item.value;
    });
    
    createRowsWithData(aggrData);
    sortRowsByTitle(sortedTitle, sortedAscending);
  }

  aggregation.append("label")
    .attr('for', function(d) { return 'radio-' + d.toLowerCase(); })
    .text(function(d) { return d; });

  //  Create table basic structure
  var table = d3.select('body').append('table')
    .classed('country-table', true);
  var thead = table.append('thead');
  var tbody = table.append('tbody');
  table.append('caption')
    .html('World Countries Ranking');

  var sortedThElement;
  //  Create table header
  thead.append('tr').selectAll('th')
    .data(neededColumns)
    .enter().append('th')
    .text(function(d) { return d.title; })
    .classed('center-text', true)
    //  Sort handler
    .on('click', function(header, i) {
      // Select sort direction
      sortedAscending = sortedTitle != header.title ? true : !sortedAscending;
      sortedTitle = header.title;

      // Set style relative sort direction
      if (sortedThElement) {
        sortedThElement.classed('up-arrowed', false);
        sortedThElement.classed('down-arrowed', false);
      }
      sortedThElement = d3.select(this);
      sortedThElement.classed('up-arrowed', sortedAscending);
      sortedThElement.classed('down-arrowed', !sortedAscending);
      sortRowsByTitle(sortedTitle, sortedAscending);
    });

  function sortRowsByTitle(title, ascending) {
    if (!title) {
      return;
    }
    // Sort rows
    tbody.selectAll('tr').sort(function(a, b) {
      if (ascending) {
        return d3.ascending(a[title], b[title])
          || d3.ascending(a['name'], b['name']);
      }
      return d3.descending(a[title], b[title])
        || d3.ascending(a['name'], b['name']);
    })
    tbody.selectAll('tr').style('background-color', null).attr('class', function(d, i) { if (i%2 !=0) { d3.select(this).style('background-color', 'coral') }
    else {d3.select(this).style('background-color', 'lightcoral')} });
  }

  function createRowsWithData(data) {

    //  Create table rows from data
    var rows = tbody.selectAll('tr.row').data(data)
      .enter().append('tr').attr('class', 'row').style('background-color', 'lightcoral')
      .attr('class', function(d, i) { if (i%2 !=0) { d3.select(this).style('background-color', 'coral') } });

    // Set columns format
    var cells = rows.selectAll('td').data(function(row) {
      return neededColumns.map(function(column, i) {
        return column.format(row[column.title]);
      });
    }).enter().append('td').text(function(d) { return d; })
      .attr('class', function(d, i) {
        return i < 2 ? 'center-text' : 'right-text';
      })
      
      //  Add mousehover events
      .on('mouseover', function(d, i) {
        d3.select(this.parentNode).style('background-color', '#F3ED86');
      })
      .on('mouseout', function() {
        tbody.selectAll('tr').attr('class', function(d, i) { if (i%2 !=0) {d3.select(this).style('background-color', 'coral') }
        	else {d3.select(this).style('background-color', 'lightcoral')}
        	 });
        	
        	//style('background-color', 'lightcoral')
          //.selectAll('td').style('background-color', null);
        
      });

  }
  filtredData = jsonData;
  createRowsWithData(filtredData);
});
});

    </script> 