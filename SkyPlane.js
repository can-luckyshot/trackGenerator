// SkyDome Demo  -  October 2001
//
// Luis R. Semp�
// visual@spheregames.com
// Sphere Games (http://www.spheregames.com)
//
// You may use, copy, distribute or create derivative software
// for any purpose. If you do, I'd appreciate it if you write me
// and let me know what you do with it. Thanks!
// Have fun!
////////////////////////////////////////////////////
 
#include <math.h>
#include "globals.h"
#include "SkyPlane.h"
 
VERTEX *PlaneVertices;
int NumPlaneVertices;
 
WORD *Indices;
int NumIndices;
 
float pRadius; // Used for rendering
 
void GenerateSkyPlane(int divisions, float PlanetRadius, float AtmosphereRadius,
                      float hTile, float vTile)
{
 
    // Make sure our vertex array is clear
    if (PlaneVertices)
    {
 
        delete PlaneVertices;
        PlaneVertices = NULL;
     
}
 
    // Make sure our index array is clear
    if (Indices)
    {
 
        delete Indices;
        Indices = NULL;
     
}
 
    // Set the number of divisions into a valid range
    int divs = divisions;
    if (divisions < 1)
        divs = 1;
 
    if (divisions > 256)
        divs = 256;
 
    pRadius = PlanetRadius;
 
    // Initialize the Vertex and Indices arrays
    NumPlaneVertices = (divs + 1) * (divs + 1);   // 1 division would give 4
													// verts
    NumIndices  = divs * divs * 2 * 3;       // 1 division would give 6
												// indices for 2 tris
 
    PlaneVertices = new VERTEX[NumPlaneVertices];
    ZeroMemory(PlaneVertices, sizeof(VERTEX));
 
    Indices = new WORD[NumIndices];
    ZeroMemory(Indices, sizeof(WORD)*NumIndices);
 
    // Calculate some values we will need
    float plane_size = 2.0f * (float)sqrt((SQR(AtmosphereRadius)-SQR(PlanetRadius)));
    float delta = plane_size/(float)divs;
    float tex_delta = 2.0f/(float)divs;
     
    // Variables we'll use during the dome's generation
    float x_dist   = 0.0f;
    float z_dist   = 0.0f;
    float x_height = 0.0f;
    float z_height = 0.0f;
    float height = 0.0f;
 
    int count = 0;
 
    VERTEX SV; // temporary vertex
 
    for (int i=0;i <= divs;i++)
    {
 
        for (int j=0; j <= divs; j++)
        {
 
            x_dist = (-0.5f * plane_size) + ((float)j*delta);
            z_dist = (-0.5f * plane_size) + ((float)i*delta);
 
            x_height = (x_dist*x_dist) / AtmosphereRadius;
            z_height = (z_dist*z_dist) / AtmosphereRadius;
            height = x_height + z_height;
 
            SV.x = x_dist;
            SV.y = 0.0f - height;
            SV.z = z_dist;
 
            // Calculate the texture coordinates
            SV.u = hTile*((float)j * tex_delta*0.5f);
            SV.v = vTile*(1.0f - (float)i * tex_delta*0.5f);
 
            PlaneVertices[i*(divs+1)+j] = SV;
         
}
     
}
 
    // Calculate the indices
    int index = 0;
    for (i=0; i < divs;i++)
    {
 
        for (int j=0; j < divs; j++)
        {
 
            int startvert = (i*(divs+1) + j);
 
            // tri 1
            Indices[index++] = startvert;
            Indices[index++] = startvert+1;
            Indices[index++] = startvert+divs+1;
 
            // tri 2
            Indices[index++] = startvert+1;
            Indices[index++] = startvert+divs+2;
            Indices[index++] = startvert+divs+1;
         
}
     
}
 
}
 
int RenderSkyPlane()
{
 
    glPushMatrix();
    glTranslatef(0.0f,pRadius,0);
    glRotatef(timeGetTime()/2000.0f,0.0f, 1.0f, 0.0f);
 
    glBegin(GL_TRIANGLES);
 
    for (int i=0; i < NumIndices; i++)
    {
 
        glColor3f(1.0f, 1.0f, 1.0f);       
 
        glTexCoord2f(PlaneVertices[Indices[i]].u, PlaneVertices[Indices[i]].v);
        glVertex3f(PlaneVertices[Indices[i]].x, PlaneVertices[Indices[i]].y, PlaneVertices[Indices[i]].z);
     
}
 
    glEnd();
 
    glPopMatrix();
    return 1;
 
}
 
void ReleaseSkyPlane()
{
 
    if (PlaneVertices)
    {
 
        delete PlaneVertices;
        PlaneVertices = NULL;
     
}
 
    if (Indices)
    {
 
        delete Indices;
        Indices = NULL;
     
}
 
}           </math.h>