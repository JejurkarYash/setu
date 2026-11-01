package main 




func PrimeNumber(n int ) bool {

	for i := 2 ; i < n ; i++ {

		if n % i == 0 {
			return false 
		}
	}

	return true 
}