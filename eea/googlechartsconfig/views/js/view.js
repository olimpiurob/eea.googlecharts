var current_chart_id;

function exportToPng(){
    var svgobj = jQuery("#googlechart_full").find("iframe").contents().find("#chart");
    jQuery(svgobj).attr("xmlns","http://www.w3.org/2000/svg");
    var svg = jQuery("#googlechart_view").find("iframe").contents().find("#chartArea").html();

    form = jQuery("#export");
    jQuery("#svg").attr("value",svg);
    form.submit()
}

function checkSVG(){
    var svg = jQuery("#googlechart_view").find("iframe").contents().find("#chartArea").html();
    if ((svg) && (svg !== "")){
        jQuery("#googlechart_export_button").show()
    }
}

function drawChart(value){
        chart_id = value[0];
        chart_json = value[1];
        chart_columns = value[2];
        chart_filters = value[3];
        chart_width = value[4];
        chart_height = value[5];
        chart_filterposition = value[6];
        chart_options = value[7];

        jQuery("#filename").attr("value",chart_json.options.title);
        jQuery("#type").attr("value","image/png");

        jQuery("#googlechart_export_button").hide()
        jQuery("#googlechart_filters").remove();
        jQuery("#googlechart_view").remove();
        jQuery("#googlechart_table").remove();
        filters = '<div id="googlechart_filters"></div>';
        view = '<div id="googlechart_view" class="googlechart"></div>';
        var googlechart_table;
        if (chart_filterposition === 0){
            googlechart_table = ""+
                "<div id='googlechart_table' class='googlechart_table googlechart_table_top'>"+
                    "<div id='googlechart_filters'></div>"+
                    "<div id='googlechart_view' class='googlechart'></div>"+
                "</div>";
        }
        if (chart_filterposition === 1){
            googlechart_table = ""+
                "<div id='googlechart_table' class='googlechart_table googlechart_table_left'>"+
                    "<div id='googlechart_filters'></div>"+
                    "<div id='googlechart_view' class='googlechart'></div>"+
                "</div>";
        }
        if (chart_filterposition === 2){
            googlechart_table = ""+
                "<div id='googlechart_table' class='googlechart_table googlechart_table_bottom'>"+
                    "<div id='googlechart_view' class='googlechart'></div>"+
                    "<div id='googlechart_filters'></div>"+
                    "<div style='clear: both'></div>" +
                "</div>";
        }
        if (chart_filterposition === 3){
            googlechart_table = ""+
                "<div id='googlechart_table' class='googlechart_table googlechart_table_right'>"+
                    "<div id='googlechart_view' class='googlechart'></div>"+
                    "<div id='googlechart_filters'></div>"+
                    "<div style='clear: both'></div>" +
                "</div>";
        }
        jQuery(googlechart_table).appendTo('#googlechart_dashboard');

        columnlabels = [];
        jQuery(chart_columns).each(function(index,chart_token){
            columnlabels.push(available_columns[chart_token]);
        });
        dataTable = [];
        dataTable.push(columnlabels);
        jQuery(merged_rows.items).each(function(index, merged_row){
            row = [];
            jQuery(chart_columns).each(function(index,chart_token){
                row.push(merged_row[chart_token]);
            });
            dataTable.push(row);
        });

/*        console.log(dataTable);
        pivottedTable = pivotTable(dataTable, [0], [1,2], 3)
        console.log(pivottedTable);*/

        chart_json.options.width = chart_width;
        chart_json.options.height = chart_height;

        jQuery.each(chart_options,function(key,value){
            chart_json.options[key]=value;
        });


        chart_json.dataTable = [];

        chart_json.containerId = "googlechart_view";
        var chart = new google.visualization.ChartWrapper(
            chart_json
        );

        filters_array = [];
        if (chart_filters){
            jQuery.each(chart_filters,function(key, value){
                filters_div = "googlechart_filters";
                filter_div_id = "googlechart_filters_"+key;
                filter_div = "<div id='"+filter_div_id+"'></div>";
                jQuery(filter_div).appendTo("#"+filters_div);
                filterSettings = {};
                filterSettings.options = {};
                filterSettings.options.ui = {};
                filterSettings.options.filterColumnLabel = available_columns[key];
                filterSettings.containerId = filter_div_id;
                switch(value){
                    case "0":
                        filterSettings.controlType = 'NumberRangeFilter';
                        break;
                    case "1":
                        filterSettings.controlType = 'StringFilter';
                        break;
                    case "2":
                        filterSettings.controlType = 'CategoryFilter';
                        filterSettings.options.ui.allowTyping = false;
                        filterSettings.options.ui.allowMultiple = false;
                        break;
                    case "3":
                        filterSettings.controlType = 'CategoryFilter';
                        filterSettings.options.ui.allowTyping = false;
                        filterSettings.options.ui.allowMultiple = true;
                        filterSettings.options.ui.selectedValuesLayout = 'belowStacked';
                        break;
                }
                filter = new google.visualization.ControlWrapper(filterSettings);
                filters_array.push(filter);
            });
        }

        if (filters_array.length > 0){
            var dashboard = new google.visualization.Dashboard(
              document.getElementById('googlechart_dashboard'));

            dashboard.bind(filters_array, chart);

            google.visualization.events.addListener(dashboard, 'ready', function(event) {
                checkSVG();
            });

            dashboard.draw(dataTable);
        }

        else{
            chart.setDataTable(dataTable);
            google.visualization.events.addListener(chart, 'ready', function(event) {
                checkSVG();
            });
            chart.draw();
        }
}

jQuery(document).ready(function($){
    if (typeof(googlechart_config_array) == 'undefined'){
        return;
    }

    jQuery(googlechart_config_array).each(function(index, value){
        tabsObj = jQuery(".googlechart_tabs");
        tabsObj.find("a[chart_id='"+value[0]+"']").addClass("googlechart_class_"+value[1].chartType);
    });

    jQuery(".googlechart_tabs").delegate("a", "click", function(){
        if (jQuery(this).attr("chart_id") !== current_chart_id){
            current_chart_id = jQuery(this).attr("chart_id");
            jQuery(".googlechart_tabs a").removeClass("current");
            jQuery(this).addClass("current");

            var index_to_use;
            jQuery(googlechart_config_array).each(function(index, value){
                if (value[0] == current_chart_id){
                    index_to_use = index;
                }
            });

            jQuery("#googlechart_filters").html('');
            jQuery("#googlechart_view").html('');

            drawChart(googlechart_config_array[index_to_use]);
        }
        return false;
    });

    value=googlechart_config_array[0];
    current_chart_id = value[0];
    drawChart(value);
});