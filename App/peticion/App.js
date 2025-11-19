import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Pressable, Text, FlatList } from 'react-native';

// REEMPLAZA ESTA URL CON LA DEL TUNEL
const SERVER_URL = 'https://ninety-geese-hide.loca.lt/';

// const DATOS_SIMULADOS = [
//   { id: '1', todo: 'Verificar resultados' },
//   { id: '2', todo: 'Enviar datos' },
//   { id: '3', todo: 'Enviar solicitud de area' },
//   { id: '4', todo: 'Terminar el reporte' },
//   { id: '5', todo: 'Solicitar material' },
//   { id: '6', todo: 'Ajustar horarios'}
// ];

const App = () => {
  // Estado para guardar el texto del input
  const [todo, setTodo] = useState('');
  const [tareas, setTareas] = useState([]);

  // Funcion para obtener las tareas
  const obtenerTareas = async () => {
    try {
      const respuesta = await fetch(`${SERVER_URL}todos`);
      if (respuesta.status == 200){
        const jsonRespuesta = await respuesta.json();
        setTareas(jsonRespuesta.data);
      } else { 
        Alert.alert("Error", `Código: ${respuesta.status}`);
      }
    }catch (error) {
      console.error(error);
      Alert.alert("Error", "No se puede conectar al servidor");
    }
  };

  // Carga la lista al iniciar la app
  useEffect(() => {
    obtenerTareas();
  }, []);

  // Función que llama al servidor con la dirección del túnel
  const agregarTodo = async () => {
    // Validación simple para no enviar datos vacíos
    if (!todo.trim()) {
      Alert.alert("Error", "Por favor, escribe una tarea.");
      return;
    }

    try {
      // Usamos fetch para enviar la petición POST
      const respuesta = await fetch(`${SERVER_URL}agrega_todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todo: todo, // Enviamos el texto del estado
        }),
      });

      // Muestra una alerta de éxito si el estado de la respuesta es 201 
      if (respuesta.status === 201) {
        const jsonRespuesta = await respuesta.json();
        Alert.alert(
          "Éxito",
          `Tarea agregada correctamente con el ID: ${jsonRespuesta.id}`
        );
        setTodo(''); // Limpiamos el campo de texto después del envío
        await obtenerTareas(); // Volver a mostrar lista de tareas actualizada
      } else {
        // Si el estado no es 201, mostramos un error
        const errorTexto = await respuesta.text();
        Alert.alert("Error en el servidor", `No se pudo agregar la tarea. ${errorTexto}`);
      }
    } catch (error) {
      // Este error ocurre si no hay conexión a internet o el servidor no responde
      console.error(error);
      Alert.alert("Error de Conexión", "No se pudo conectar con el servidor. Verifica la URL y tu conexión.");
    } 
  };
  
  //  Vista de la lista de tareas
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.todo}</Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {/*  FlatList con datos simulados  */}
      <View style={styles.flatContainer}>
        <Text style={styles.listTitle}>Lista de Tareas (Simuladas)</Text>
        <FlatList
          data={tareas}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </View>

      {/*  Formulario */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Nueva Tarea</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe tu tarea aquí..."
          value={todo}
          onChangeText={setTodo}
        />
        <Pressable
          style={({ pressed }) => [
            styles.button]}
          onPress={agregarTodo}
        >
          <Text style={styles.buttonText}>Agregar Tarea</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  flatContainer: {
    paddingTop: 20,
    paddingBottom: 20, 
    flex: 2,
  },

  itemContainer: {
    backgroundColor: '#f5f5f5',
    padding: 4,
    marginVertical: 4,
    borderRadius: 2,
    borderColor: '#f5f5f5',
    borderWidth: 1,
  },

  formContainer: {
    paddingTop: 10,
    paddingBottom: 10, 
    flex: 1,
  },
  
  itemText: {
    fontSize: 16,
  },

  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  textInput: {
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },

  button: {
    backgroundColor: '#2e2e2eff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
