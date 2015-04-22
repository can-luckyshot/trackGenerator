SkyDome = function( radius,  dtheta,  dphi,  hTile,  vTile){
 var DTOR = Math.pi /180.0;
    var theta, phi;
 
    // Make sure our vertex array is clear
    
 
    // Initialize our Vertex array
    NumVertices = ((360/dtheta)*(90/dphi)*4);
    Vertices = new VERTEX[NumVertices];
    
 
    // Used to calculate the UV coordinates
    var vx, vy, vz, mag;
 
    // Generate the dome
    var n = 0;
    for (phi=0; phi <= 90 - dphi; phi += dphi)
    {
 
        for (theta=0; theta <= 360 - dtheta; theta += dtheta)
        {
 
            // Calculate the vertex at phi, theta
            Vertices[n].x = radius * sinf(phi*DTOR) * cosf(DTOR*theta);
            Vertices[n].y = radius * sinf(phi*DTOR) * sinf(DTOR*theta);
            Vertices[n].z = radius * cosf(phi*DTOR);
 
            // Create a vector from the origin to this vertex
            vx = Vertices[n].x;
            vy = Vertices[n].y;
            vz = Vertices[n].z;
 
            // Normalize the vector
            mag = (float)sqrt(SQR(vx)+SQR(vy)+SQR(vz));
            vx /= mag;
            vy /= mag;
            vz /= mag;
 
            // Calculate the spherical texture coordinates
            Vertices[n].u = hTile * (float)(atan2(vx, vz)/(PI*2)) + 0.5f;
            Vertices[n].v = vTile * (float)(asinf(vy) / PI) + 0.5f;    
            n++;
 
            // Calculate the vertex at phi+dphi, theta
            Vertices[n].x = radius * sinf((phi+dphi)*DTOR) * cosf(theta*DTOR);
            Vertices[n].y = radius * sinf((phi+dphi)*DTOR) * sinf(theta*DTOR);
            Vertices[n].z = radius * cosf((phi+dphi)*DTOR);
             
            // Calculate the texture coordinates
            vx = Vertices[n].x;
            vy = Vertices[n].y;
            vz = Vertices[n].z;
 
            mag = (float)sqrt(SQR(vx)+SQR(vy)+SQR(vz));
            vx /= mag;
            vy /= mag;
            vz /= mag;
 
            Vertices[n].u = hTile * (float)(atan2(vx, vz)/(PI*2)) + 0.5f;
            Vertices[n].v = vTile * (float)(asinf(vy) / PI) + 0.5f;    
            n++;
 
            // Calculate the vertex at phi, theta+dtheta
            Vertices[n].x = radius * sinf(DTOR*phi) * cosf(DTOR*(theta+dtheta));
            Vertices[n].y = radius * sinf(DTOR*phi) * sinf(DTOR*(theta+dtheta));
            Vertices[n].z = radius * cosf(DTOR*phi);
             
            // Calculate the texture coordinates
            vx = Vertices[n].x;
            vy = Vertices[n].y;
            vz = Vertices[n].z;
 
            mag = (float)sqrt(SQR(vx)+SQR(vy)+SQR(vz));
            vx /= mag;
            vy /= mag;
            vz /= mag;
 
            Vertices[n].u = hTile * (float)(atan2(vx, vz)/(PI*2)) + 0.5f;
            Vertices[n].v = vTile * (float)(asinf(vy) / PI) + 0.5f;    
            n++;
 
            if (phi > -90 && phi < 90)
            {
 
                // Calculate the vertex at phi+dphi, theta+dtheta
                Vertices[n].x = radius * sinf((phi+dphi)*DTOR) * cosf(DTOR*(theta+dtheta));
                Vertices[n].y = radius * sinf((phi+dphi)*DTOR) * sinf(DTOR*(theta+dtheta));
                Vertices[n].z = radius * cosf((phi+dphi)*DTOR);
                 
                // Calculate the texture coordinates
                vx = Vertices[n].x;
                vy = Vertices[n].y;
                vz = Vertices[n].z;
 
                mag = (float)sqrt(SQR(vx)+SQR(vy)+SQR(vz));
                vx /= mag;
                vy /= mag;
                vz /= mag;
 
                Vertices[n].u = hTile * (float)(atan2(vx, vz)/(PI*2)) + 0.5f;
                Vertices[n].v = vTile * (float)(asinf(vy) / PI) + 0.5f;    
                n++;
             
}
         
}
     
}
 
    // Fix the problem at the seam
    for (i=0; i < NumVertices-3; i++)
    {
 
        if (Vertices[i].u - Vertices[i+1].u > 0.9f)
            Vertices[i+1].u += 1.0f;
 
        if (Vertices[i+1].u - Vertices[i].u > 0.9f)
            Vertices[i].u += 1.0f;
 
        if (Vertices[i].u - Vertices[i+2].u > 0.9f)
            Vertices[i+2].u += 1.0f;
 
        if (Vertices[i+2].u - Vertices[i].u > 0.9f)
            Vertices[i].u += 1.0f;
 
        if (Vertices[i+1].u - Vertices[i+2].u > 0.9f)
            Vertices[i+2].u += 1.0f;
 
        if (Vertices[i+2].u - Vertices[i+1].u > 0.9f)
            Vertices[i+1].u += 1.0f;
 
        if (Vertices[i].v - Vertices[i+1].v > 0.8f)
            Vertices[i+1].v += 1.0f;
 
        if (Vertices[i+1].v - Vertices[i].v > 0.8f)
            Vertices[i].v += 1.0f;
 
        if (Vertices[i].v - Vertices[i+2].v > 0.8f)
            Vertices[i+2].v += 1.0f;
 
        if (Vertices[i+2].v - Vertices[i].v > 0.8f)
            Vertices[i].v += 1.0f;
 
        if (Vertices[i+1].v - Vertices[i+2].v > 0.8f)
            Vertices[i+2].v += 1.0f;
 
        if (Vertices[i+2].v - Vertices[i+1].v > 0.8f)
            Vertices[i+1].v += 1.0f;
     
}
 
}
SkyDome.prototype = Object.create( THREE.Geometry.prototype );
SkyDome.prototype.constructor = SkyDome;