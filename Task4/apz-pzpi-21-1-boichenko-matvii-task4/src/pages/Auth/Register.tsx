import React, { useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Input, Stack, Switch, Text, useToast } from '@chakra-ui/react';
import { Colors } from '@styles/colors.ts';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@stores/User/types.ts';
import * as ApiClient from "@api/client";
import { AppStore } from "@stores/index.ts";
import { RegisterData } from "@pages/Auth/types.ts";
import { useTranslation } from "react-i18next";

const Register = () => {
  const {t} = useTranslation();
  const [registerData, setRegisterData] = useState<RegisterData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    birthdate: undefined,
    role: UserRole.Customer,
  });
  const toast = useToast();
  const navigate = useNavigate();
  const userStore = AppStore.useUserStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value, type, checked} = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setRegisterData({...registerData, [name]: newValue});
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({...registerData, role: e.target.checked ? UserRole.Deliverer : UserRole.Customer});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await ApiClient.registerRegisterApiV1AuthRegisterPost(
      {requestBody: registerData})
    const loginData = await ApiClient.authJwtLoginApiV1AuthJwtLoginPost(
      {formData: {username: data.email, password: registerData.password}})
    const isSuccessful = !!data && !!loginData; // Mock success
    if (isSuccessful) {
      userStore.authorize(loginData.access_token);
      toast({
        title: t('register_success'),
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      navigate('/profile');
    } else {
      toast({
        title: t('register_fail'),
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={Colors.background} h='full' py={12} px={6}>
      <Box maxW='md' mx='auto' p={8} bg={Colors.primaryBeige} borderRadius='md' boxShadow='lg'>
        <Text fontSize='2xl' mb={6} textAlign='center' color={Colors.textRegular}>{t('register_title')}</Text>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id='first_name' isRequired>
              <FormLabel>{t('firstname_input')}</FormLabel>
              <Input type='text' name='first_name' value={registerData.first_name} onChange={handleChange} />
            </FormControl>
            <FormControl id='last_name' isRequired>
              <FormLabel>{t('lastname_input')}</FormLabel>
              <Input type='text' name='last_name' value={registerData.last_name} onChange={handleChange} />
            </FormControl>
            <FormControl id='email' isRequired>
              <FormLabel>{t('email_input')}</FormLabel>
              <Input type='email' name='email' value={registerData.email} onChange={handleChange} />
            </FormControl>
            <FormControl id='password' isRequired>
              <FormLabel>{t('password_input')}</FormLabel>
              <Input type='password' name='password' value={registerData.password} onChange={handleChange} />
            </FormControl>
            <FormControl id='birthdate'>
              <FormLabel>{t('birthdate_input')}</FormLabel>
              <Input type='date' name='birthdate' value={registerData.birthdate} onChange={handleChange} />
            </FormControl>
            <FormControl id='role'>
              <Flex justifyContent='start' alignItems='center' gap='15px'>
                <Text>{t('is_deliverer_input')}</Text>
                <Switch colorScheme='green'
                        isChecked={registerData.role === UserRole.Deliverer}
                        onChange={handleRoleChange} />
              </Flex>
            </FormControl>
            <Button type='submit' colorScheme='green' bg={Colors.primaryGreen} width='full'>{t('register_cta')}</Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default Register;
