# Static Chatbot - despliegue rápido

Este pequeño directorio contiene una página estática de ejemplo que monta un widget/chatbot y llama al backend del proyecto.

Archivos:
- `index.html` - Demo del chatbot. Edita la constante `API_URL` dentro del script para apuntar a tu backend si no usas la URL por defecto.

Deploy recomendado (DigitalOcean App Platform):

1. Haz commit y push al repo:

```powershell
git add static-chatbot/index.html static-chatbot/README.md
git commit -m "Add static chatbot demo"
git push origin master
```

2. En DigitalOcean → Apps → Create App → Connect GitHub → selecciona este repo y branch.
   - Añade un componente "Static Site" y configura `Source directory` como `static-chatbot`.
   - Deja `Build command` vacío y `Output directory` en `/`.
   - Activa deploy on push si quieres.

3. Alternativa: usa `doctl` con `app-static.yaml` (en la raíz del repo) para crear la app automáticamente.

Consideraciones de seguridad:
- No incluyas claves secretas en el frontend. Si necesitas proteger llamadas, crea un proxy en el backend.
- El ejemplo apunta por defecto a `https://back-jqdv9.ondigitalocean.app` — cámbialo si tu backend está en otra URL.

¿Quieres que haga el commit y cree la App con `doctl` por ti? Si es así, dame el permiso para crear el `app-static.yaml` (ya incluido en el repo) o indica si prefieres hacerlo desde el panel web.
