/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Fragment Phong Shader to be extended to a "Planet" shader.
 *
 * expects position and normal vectors in eye coordinates per vertex;
 * expects uniforms for ambient light, directional light, and phong material.
 * 
 *
 */

precision mediump float;

// position and normal in eye coordinates
varying vec4  ecPosition;
varying vec3  ecNormal;
varying vec2 texCoord;

// transformation matrices
uniform mat4  modelViewMatrix;
uniform mat4  projectionMatrix;

// Ambient Light
uniform vec3 ambientLight;

uniform bool debug;
uniform bool daylight;
uniform bool nightlight;
uniform bool clouds;
uniform bool bathymetry;
uniform bool redgreen;

// Textures
uniform sampler2D daylightTex;
uniform sampler2D nightlightTex;
uniform sampler2D bathymetryTex;
uniform sampler2D topographyTex;
uniform sampler2D cloudTex;

// Material
struct PhongMaterial {
    vec3  ambient;
    vec3  diffuse;
    vec3  specular;
    float shininess;
};
uniform PhongMaterial material;

// Light Source Data for a directional light
struct LightSource {

    int  type;
    vec3 direction;
    vec3 color;
    bool on;
    
} ;
uniform LightSource light;

/*

 Calculate surface color based on Phong illumination model.
 - pos:  position of point on surface, in eye coordinates
 - n:    surface normal at pos
 - v:    direction pointing towards the viewer, in eye coordinates
 + assuming directional light
 
 */
vec3 phong(vec3 pos, vec3 n, vec3 v, LightSource light, PhongMaterial material) {

    // ambient part
    vec3 ambient = material.ambient * ambientLight;

    vec3 dayTex = texture2D(daylightTex, texCoord).rgb;
    vec3 nightTex = texture2D(nightlightTex, texCoord).rgb;
    vec3 bathTex = texture2D(bathymetryTex, texCoord).rgb;
    vec3 cTex = texture2D(cloudTex, texCoord).rgb;
    vec3 topoTex = texture2D(topographyTex, texCoord).rgb;

    // back face towards viewer (looking at the earth from the inside)?
    float ndotv = dot(n,v);
    if(ndotv<0.0) {
        return vec3(0, 0, 0);
    }

    if (redgreen) {
        if (bathTex.x <= 0.2) {
            return vec3(1, 0, 0);
        } else {
            return vec3(0, 1, 0);
        }
    }

    // vector from light to current point
    vec3 l = normalize(light.direction);
    
    // cos of angle between light and surface. 
    float ndotl = dot(n,-l);

    vec3 diffuse;

    // add or remove lightness if cloud is over it
    if (clouds) {
        dayTex = dayTex + cTex;
        nightTex = nightTex - cTex;
    }

    if (daylight) {
        if (nightlight) {
            diffuse =2.0 * dayTex * ndotl + nightTex * vec3(0.4,0.4,0.4) * pow((1.0 - ndotl),2.5) * light.color;
        } else {
            diffuse = dayTex * ndotl * light.color;
        }
    } else {
        diffuse = material.diffuse * light.color * ndotl;
    }
    if (!daylight && nightlight) {
        diffuse = material.diffuse * light.color * ndotl;
    }

    if(ndotl<=0.0) {
        if (nightlight) {
            diffuse = nightTex * vec3(0.6,0.6,0.6);
        } else if (daylight) {
            diffuse = dayTex * vec3(0.08,0.08,0.08);
        }
    }

     // reflected light direction = perfect reflection direction
    vec3 r = reflect(l,n);
    
    // angle between reflection dir and viewing dir
    float rdotv = max( dot(r,v), 0.0);

     vec3 specular;

    if (bathymetry) {

        float reflectionColor;
        if (clouds) {
            reflectionColor = (bathTex.x + cTex.x) / 2.0;
        } else {
            reflectionColor = bathTex.x;
        }

        float reflectionFactor = reflectionColor;
        float shininess = material.shininess + (100.0 * (1.0 - reflectionFactor)) ;
        vec3 specularReflexion = material.specular * reflectionFactor;
        specular = (specularReflexion * light.color * pow(rdotv, shininess));

    } else {
        specular = material.specular * light.color * pow(rdotv, material.shininess);
    }

    if (debug) {
        if(ndotl >= 0.0 && ndotl <= 0.03) {
            return vec3(0,1,0);
        }
    }

    // return sum of all contributions
    return ambient + diffuse + specular;
    
}

void main() {
    
    // normalize normal after projection
    vec3 normalEC = normalize(ecNormal);
    
    // do we use a perspective or an orthogonal projection matrix?
    bool usePerspective = projectionMatrix[2][3] != 0.0;
    
    // for perspective mode, the viewing direction (in eye coords) points
    // from the vertex to the origin (0,0,0) --> use -ecPosition as direction.
    // for orthogonal mode, the viewing direction is simply (0,0,1)
    vec3 viewdirEC = usePerspective? normalize(-ecPosition.xyz) : vec3(0,0,1);
    
    // calculate color using phong illumination
    vec3 color = phong( ecPosition.xyz, normalEC, viewdirEC, light, material );

    vec3 stripe = color * vec3(0.2, 0.2, 0.2);

    if (debug){
        if (mod(texCoord.s, 0.1) >= 0.05) {
           gl_FragColor = vec4(color, 1.0);
        } else {
           gl_FragColor = vec4(stripe, 1.0);
        }
    } else {
         gl_FragColor = vec4(color, 1.0);
    }

    
}
