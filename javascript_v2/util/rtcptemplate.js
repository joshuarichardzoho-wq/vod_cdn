//$Id$
/* A simple html template replacer
 *
 * Functions:
 * 1) It will replace html string template with the values provided in object.
 * 2) It will escape the passed values which will help to avoid xss.
 * 3) Replace value with your resource object.
 *
 * Usage:
 * 1) Basic:
 *  Pass the key with double curly braces and pass a object with that key to replace it.
 *  var html = "<b>My Name is {{name}}!</b>";
 *  $RTCPTemplate.replace( html, { name: "Alex" } );
 *  The above call will return "<b>My Name is Alex</b>";
 *
 * 2) Resource:
 *  Dollar symbol prepended in the key indicates that the value is a resource
 *  key and it will replace the value with the output of resource.getRealValue
 *  method
 *  Pass your resource method by using following method:
 *  $RTCPTemplate.setResource( RTCPResource );//Need to be set only once
 *
 *  var html = "<b>{{today}}</b><div>{{date}}</div>";
 *  $RTCPTemplate.replace( html, { $today: "date.today", date:"7/5/15" } );
 *  The above call return "<b>இன்று</b><div>7/5/15</div>";
 *
 *  To pass params to resource method, pass the value as array.
 *  Eg: { $today: ["date.year", "2015"] }
 *
 * 3) Html content as value:
 *  If you donot want to escape the values passed, you can pass a third paramater "InSecureHTML".
 *  Note: This will be required only if you are passing server rendered html content, otherwise
 *  avoid overriding escape.
 */

var $RTCPTemplate = {};
$RTCPTemplate.setResource = function( resource ) {
    this.resource = resource;
};

$RTCPTemplate.replace = function( template, data, htmltype ) {
    var resultobj = {};

    function unEscapeText(value)
    {
        return value.replace( /&#39;|&#x27;/g, "'" ).replace( /&quot;/g, "\"" ).replace( /&gt;/g, ">" ).replace( /&lt;/g, "<" ).replace( /&amp;/g, "&" );
    }

    function escapeText( text ) {
        text = unEscapeText("" + text);
        var escape_lookup = {
            "&": "&amp;",
            ">": "&gt;",
            "<": "&lt;",
            "\"": "&quot;", //No I18N
            "'": "&#x27;"
        };
        return ( text ).replace( /[&><"']/g, function( match ) {
            return escape_lookup[ match ];
        } );
    }

    function isArray( obj ) {
            return Object.prototype.toString.call( obj ) === "[object Array]";
    }

    function replaceResource( value ) {
        var resourceidentifier = value;
        if ( isArray( resourceidentifier ) ) {
            var replacevalues = resourceidentifier[ 1 ];
            replacevalues = isArray( replacevalues ) ? replacevalues : [ replacevalues ];
            replacevalues = replacevalues.map(function( resourcevalue ){
                return escapeText( resourcevalue );
            });
            resourceidentifier[ 1 ] = replacevalues;
            return $RTCPTemplate.resource.getRealValue.apply( $RTCPTemplate.resource, resourceidentifier );
        } else {
            return $RTCPTemplate.resource.getRealValue( value );
        }
    }
    for ( var key in data ) {
        var resourcekey = /^\$/.test( key );
        if ( resourcekey ) {
            var temp = replaceResource( data[ key ] );
            key = key.substring( 1 ); //Removing resource identifier ($symbol)
            resultobj[ key ] = temp;
        } else {
            resultobj[ key ] = htmltype === "InSecureHTML" ? data[ key ] : escapeText( data[ key ] );
        }
    }

    var regexstr = Object.keys( resultobj ).join( "|" );
    var regexp = new RegExp( "{{(" + regexstr + ")}}", "g" );

    return template.replace( regexp, function( match ) {
        match = match.substring( 2 ).slice( 0, -2 );
        return resultobj[ match ];
    } );
};